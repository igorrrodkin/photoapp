import { pgTable, text, numeric } from "drizzle-orm-pg";
import "dotenv/config";

export const albums = pgTable("albums", {
  login: text("login").primaryKey(),
  albumName: text("album_name"),
  albumLocation: text("album_location"),
  datapicker: text("datapicker"),
  accessClients: text("access_clients"),
  price: numeric("price"),
  priceId: text("price_id"),
  productId: text("product_id"),
});
