import { RequestHandler } from "express";
import { authClients } from "../../utils/authMiddleware.js";
import Albums from "../../db/albums/Albums.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { stripe } from "../../utils/payment.js";

const URL = process.env.DEV_URL;

class PaymentController extends Controller {
  public readonly path: string;

  public constructor(path: string, public readonly albums: Albums) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.get("/buy/:albumid", authClients, catchAsync(this.buyAlbum));
    // this.router.get(
    //   "/:albumid/cancel",
    //   authClients,
    //   catchAsync(this.cancelPayment)
    // );
  };

  public buyAlbum: RequestHandler = async (req, res) => {
    const albumId = req.params.albumid;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${URL}/clients/dashboard/thankyou/${albumId}`,
      cancel_url: `${URL}/clients/dashboard/cancel/${albumId}`,
    });

    res.redirect(303, session.url!);
  };
}

export default PaymentController;
