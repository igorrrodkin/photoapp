import { pgTable, text, numeric, boolean, InferModel } from "drizzle-orm-pg";
import "dotenv/config";

export const clients = pgTable("clients", {
  login: text("login").primaryKey(),
  password: text("password"),
  otp: numeric("otp"),
  resendOtp: boolean("resend_otp"),
  name: text("name"),
});

export type Client = InferModel<typeof clients>;
