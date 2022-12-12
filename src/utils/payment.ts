import Stripe from "stripe";

const secretAPIkey = process.env.STRIPE_SECRET;

export const stripe: Stripe = new Stripe(secretAPIkey, {
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
