import { pgTable, text, numeric, boolean, InferModel } from "drizzle-orm-pg";

export const clients = pgTable("clients", {
  phoneNumber: text("phone_number"),
  otp: numeric("otp"),
  resendOtp: boolean("resend_otp"),
  name: text("name"),
  otpDepartureDate: text("otp_departure_date"),
  email: text("email"),
  uuid: text("uuid"),
  availablePhotos: text("available_photos"),
});

export type Client = InferModel<typeof clients>;
