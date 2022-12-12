import { pgTable, text } from "drizzle-orm-pg";
import "dotenv/config";

export const photographers = pgTable("photographers", {
  login: text("login").primaryKey(),
  password: text("password"),
  fullname: text("fullname"),
  email: text("email"),
});
