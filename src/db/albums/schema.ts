import { pgTable, text } from "drizzle-orm-pg";
import "dotenv/config";

export const albums = pgTable("albums", {
  login: text("login"),
  albumName: text("album_name"),
  albumLocation: text("album_location"),
  datapicker: text("datapicker"),
});
