import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";

import {
  createCheckoutSession as createCheckoutSessionService,
  getMyPaymentHistory,
  processStripeWebhook,
} from "./payment.service.js";

export const createCheckoutSession: RequestHandler = async (
  req,
  res
) => {
  const checkout = await createCheckoutSessionService(
    req.currentUser!
  );

  return sendSuccess(res, {
    message: "Stripe Checkout session created successfully.",
    data: checkout,
  });
};

export const getMyPayments: RequestHandler = async (
  req,
  res
) => {
  const payments = await getMyPaymentHistory(
    req.currentUser!._id
  );

  return sendSuccess(res, {
    message: "Payment history retrieved successfully.",
    data: payments,
  });
};

export const stripeWebhook: RequestHandler = async (
  req,
  res
) => {
  const signature = req.get("stripe-signature");

  if (!signature || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      success: false,
      status: "fail",
      message: "Invalid Stripe webhook request.",
    });
  }

  await processStripeWebhook(req.body, signature);

  return res.status(200).json({
    received: true,
  });
};