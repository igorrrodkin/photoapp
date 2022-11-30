import { RequestHandler } from "express";
import { availableAlbums } from "../db/databaseApi.js";
import { extractLoginFromJWT } from "../controllers/clients/authController.js";
import Stripe from "stripe";

const secretAPIkey =
  "sk_test_51M7Jn3Adu1TKJZJsHZQGEOaWZEHYlLeV0AjoSLImGQsm3N0Y10idoZp27USmeyHWvACFcWHhQFNeKfvPJ1haKaCG009YnRDq8G";

const stripe = new Stripe(secretAPIkey, {
  apiVersion: "2022-11-15",
  typescript: true,
});

export const createProduct = async (
  login: string,
  album: string,
  price: number
) => {
  const productData = await stripe.products.create({
    name: `${album}, photographer: ${login}`,
  });
  const priceData = await stripe.prices.create({
    unit_amount: price,
    currency: "usd",
    product: productData.id,
  });
  return [productData, priceData];
};
