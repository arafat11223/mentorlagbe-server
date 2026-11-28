import Stripe from "stripe";
import { ObjectId } from "mongodb";

import {
  paymentsCollection,
  usersCollection,
} from "../../config/database.js";

import { env } from "../../config/env.js";

import type {
  PaymentDocument,
  UserDocument,
  UserRole,
} from "../../types/database.js";

import { AppError } from "../../utils/AppError.js";

const PLAN_PRICES = {
  student: {
    planName: "Student Pro",
    amount: 10,
    unitAmount: 1000,
  },
  tutor: {
    planName: "Tutor Pro",
    amount: 15,
    unitAmount: 1500,
  },
} as const;

type CheckoutRole = keyof typeof PLAN_PRICES;

type CheckoutVerificationResult = {
  paymentStatus: "paid" | "pending";
  plan: "free" | "pro";
  activated: boolean;
};

function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(
      "Stripe payments are not configured yet.",
      503
    );
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

function isCheckoutRole(role: string): role is CheckoutRole {
  return role === "student" || role === "tutor";
}

function validateCheckoutSession(
  session: Stripe.Checkout.Session,
  expectedUser?: UserDocument
): {
  userId: ObjectId;
  role: CheckoutRole;
  pricing: (typeof PLAN_PRICES)[CheckoutRole];
} {
  const metadata = session.metadata;

  if (
    !metadata?.userId ||
    !metadata.userRole ||
    !metadata.planName ||
    !ObjectId.isValid(metadata.userId) ||
    session.client_reference_id !== metadata.userId
  ) {
    throw new AppError(
      "Stripe checkout metadata or client reference is invalid.",
      400
    );
  }

  if (!isCheckoutRole(metadata.userRole)) {
    throw new AppError(
      "Invalid user role in Stripe checkout.",
      400
    );
  }

  const role = metadata.userRole;
  const pricing = PLAN_PRICES[role];
  const userId = new ObjectId(metadata.userId);

  if (
    expectedUser &&
    (
      !expectedUser._id.equals(userId) ||
      expectedUser.role !== role
    )
  ) {
    throw new AppError(
      "This checkout session does not belong to your account.",
      403
    );
  }

  if (
    session.mode !== "payment" ||
    metadata.planName !== pricing.planName ||
    session.currency !== "usd" ||
    (
      session.amount_total !== null &&
      session.amount_total !== pricing.unitAmount
    )
  ) {
    throw new AppError(
      "Stripe payment amount or plan verification failed.",
      400
    );
  }

  return {
    userId,
    role,
    pricing,
  };
}

export async function createCheckoutSession(
  user: UserDocument
): Promise<{ sessionId: string; url: string }> {
  if (!isCheckoutRole(user.role)) {
    throw new AppError(
      "Only students and tutors can purchase Pro plans.",
      403
    );
  }

  if (user.plan === "pro") {
    throw new AppError(
      "Your account already has an active Pro plan.",
      409
    );
  }

  const pricing = PLAN_PRICES[user.role];
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    customer_email: user.email,
    client_reference_id: user._id.toString(),

    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pricing.unitAmount,
          product_data: {
            name: pricing.planName,
            description: "MentorLagbe one-time Pro plan payment",
          },
        },
      },
    ],

    metadata: {
      userId: user._id.toString(),
      userRole: user.role,
      planName: pricing.planName,
    },

    success_url:
      `${env.CLIENT_URL}/payment/success` +
      "?session_id={CHECKOUT_SESSION_ID}",

    cancel_url: `${env.CLIENT_URL}/payment/cancel`,
  });

  if (!session.url) {
    throw new AppError(
      "Could not create a Stripe Checkout URL.",
      502
    );
  }

  const now = new Date();

  const payment: PaymentDocument = {
    _id: new ObjectId(),
    userId: user._id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    planName: pricing.planName,
    amount: pricing.amount,
    currency: "usd",
    transactionId: null,
    stripeSessionId: session.id,
    stripeEventId: null,
    paymentStatus: "pending",
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await paymentsCollection().updateOne(
    { stripeSessionId: session.id },
    { $setOnInsert: payment },
    { upsert: true }
  );

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function getMyPaymentHistory(
  userId: ObjectId
): Promise<PaymentDocument[]> {
  return paymentsCollection()
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
}

async function processPaidCheckoutSession(
  session: Stripe.Checkout.Session,
  eventId?: string
): Promise<void> {
  if (
    session.mode !== "payment" ||
    session.payment_status !== "paid"
  ) {
    return;
  }

  const { userId, role, pricing } =
    validateCheckoutSession(session);


  // Never activate a Pro plan unless Stripe confirms the exact server-side amount.
  if (session.amount_total !== pricing.unitAmount) {
    throw new AppError(
      "Stripe payment amount verification failed.",
      400
    );
  }
  const user = await usersCollection().findOne({
    _id: userId,
    role,
  });

  if (!user) {
    throw new AppError(
      "The account associated with this payment was not found.",
      404
    );
  }

  const now = new Date();

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  if (!transactionId) {
    throw new AppError(
      "The Stripe transaction could not be verified.",
      400
    );
  }

  const existingPayment = await paymentsCollection().findOne({
    stripeSessionId: session.id,
  });

  if (
    existingPayment &&
    (
      !existingPayment.userId.equals(user._id) ||
      existingPayment.userRole !== role ||
      existingPayment.planName !== pricing.planName ||
      existingPayment.amount !== pricing.amount ||
      existingPayment.currency !== "usd"
    )
  ) {
    throw new AppError(
      "Stripe session does not match its payment record.",
      400
    );
  }

  const pendingPayment: PaymentDocument = {
    _id: new ObjectId(),
    userId: user._id,
    userEmail: user.email,
    userName: user.name,
    userRole: role,
    planName: pricing.planName,
    amount: pricing.amount,
    currency: "usd",
    transactionId: null,
    stripeSessionId: session.id,
    stripeEventId: null,
    paymentStatus: "pending",
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await paymentsCollection().updateOne(
    { stripeSessionId: session.id },
    { $setOnInsert: pendingPayment },
    { upsert: true }
  );

  const paymentUpdate: Record<string, unknown> = {
    transactionId,
    paymentStatus: "paid",
    paidAt: now,
    updatedAt: now,
  };

  if (eventId) {
    paymentUpdate.stripeEventId = eventId;
  }

  await paymentsCollection().updateOne(
    {
      stripeSessionId: session.id,
      userId: user._id,
      paymentStatus: { $ne: "paid" },
    },
    {
      $set: paymentUpdate,
    }
  );

  // A webhook arriving after verification can still record its event ID.
  if (eventId) {
    await paymentsCollection().updateOne(
      {
        stripeSessionId: session.id,
        userId: user._id,
        paymentStatus: "paid",
        stripeEventId: null,
      },
      {
        $set: {
          stripeEventId: eventId,
          updatedAt: now,
        },
      }
    );
  }

  const verifiedPayment = await paymentsCollection().findOne({
    stripeSessionId: session.id,
    userId: user._id,
    paymentStatus: "paid",
  });

  if (!verifiedPayment) {
    throw new AppError(
      "The verified payment record could not be confirmed.",
      500
    );
  }

  const activation = await usersCollection().updateOne(
    { _id: user._id, role },
    {
      $set: {
        plan: "pro",
        updatedAt: now,
      },
    }
  );

  if (activation.matchedCount !== 1) {
    throw new AppError(
      "Could not activate the verified Pro membership.",
      500
    );
  }
}

export async function verifyCheckoutSession(
  sessionId: string,
  currentUser: UserDocument
): Promise<CheckoutVerificationResult> {
  if (!isCheckoutRole(currentUser.role)) {
    throw new AppError(
      "Only students and tutors can verify a Pro checkout.",
      403
    );
  }

  if (!sessionId.trim()) {
    throw new AppError(
      "A Stripe checkout session ID is required.",
      400
    );
  }

  const stripe = getStripeClient();

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    throw new AppError(
      "The Stripe checkout session could not be found.",
      404
    );
  }

  validateCheckoutSession(session, currentUser);

  if (session.mode !== "payment") {
    throw new AppError(
      "This is not a valid one-time checkout session.",
      400
    );
  }

  if (session.payment_status !== "paid") {
    return {
      paymentStatus: "pending",
      plan: currentUser.plan,
      activated: false,
    };
  }

  // Same processing function is used by both verification and webhook.
  await processPaidCheckoutSession(session);

  return {
    paymentStatus: "paid",
    plan: "pro",
    activated: true,
  };
}

export async function processStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<void> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      "Stripe webhook is not configured yet.",
      503
    );
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    throw new AppError(
      "Invalid Stripe webhook signature.",
      400
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await processPaidCheckoutSession(session, event.id);
  }
}
