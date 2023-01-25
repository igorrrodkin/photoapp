import { pgTable, text } from "drizzle-orm-pg";

export const albums = pgTable("albums", {
  login: text("login"),
  albumName: text("album_name"),
  albumLocation: text("album_location"),
  datapicker: text("datapicker"),
  albumId: text("album_uuid"),
});
