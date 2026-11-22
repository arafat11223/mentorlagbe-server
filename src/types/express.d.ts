
import type { UserDocument } from "./database.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        name: string;
        email: string;
      };

      currentUser?: UserDocument;
    }
  }
}

export {};
