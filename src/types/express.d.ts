import { Role } from "./enums";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      isActive: boolean;
      isEmailVerified: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}