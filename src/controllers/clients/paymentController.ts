import { RequestHandler } from "express";
import { authClients } from "../../utils/authMiddleware.js";
import Albums from "../../db/albums/albumsApi.js";
import { extractLoginFromJWT } from "../../utils/jwt.js";
import { getObjectBody, listFolderObjects } from "../../s3/s3api.js";
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
    this.router.get(
      "/:photographer/:album/buy",
      authClients,
      catchAsync(this.buyAlbum)
    );
    this.router.get(
      "/:photographer/:album/success",
      authClients,
      catchAsync(this.downloadImages)
    );
    this.router.get(
      "/:photographer/:album/:photo/download",
      authClients,
      catchAsync(this.loadImage)
    );
    this.router.get(
      "/:photographer/:album/cancel",
      authClients,
      this.cancelPayment
    );
  };

  public buyAlbum: RequestHandler = async (req, res) => {
    const [photographer, album]: string[] = [
      req.params.photographer,
      req.params.album,
    ];
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const albums = await this.albums.availableAlbums(login);

      const currentAlbum = albums.find((item) => {
        return item.albumName == album && item.login == photographer;
      });
      if (currentAlbum) {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: currentAlbum.priceId!,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${URL}/clients/dashboard/${photographer}/${album}/payment/success`,
          cancel_url: `${URL}/clients/dashboard/${photographer}/${album}/payment/cancel`,
        });

        res.redirect(303, session.url!);
      } else {
        res.status(404).send({
          message: "Album not found!",
        });
      }
    } else {
      res.status(403).send({
        message: "invalid login",
      });
    }
  };

  public downloadImages: RequestHandler = async (req, res) => {
    const album = req.params.album;
    const photographer = req.params.photographer;
    const params = {
      Bucket: "images-photo-app",
      Prefix: `albums/${photographer}-${album}`,
    };
    const arrayOfPhotoNames: (string | undefined)[] = await listFolderObjects(
      params
    );

    if (arrayOfPhotoNames) {
      res.status(200).send({
        message: "Images that you can load",
        images: arrayOfPhotoNames,
      });
    } else {
      res.status(404).send({
        message: "Album not found or it is empty!",
      });
    }
  };

  public loadImage: RequestHandler = async (req, res) => {
    const album = req.params.album;
    const photographer = req.params.photographer;
    const image = req.params.photo;
    const params = {
      Bucket: "images-photo-app",
      Prefix: `albums/${photographer}-${album}`,
    };
    const arrayOfPhotoNames: (string | undefined)[] = await listFolderObjects(
      params
    );

    if (arrayOfPhotoNames) {
      res.setHeader("Content-disposition", `attachment;filename=${image}`);
      res.setHeader("Content-Type", "image/*");
      const imgBody = getObjectBody(params, image);
      res.send(imgBody);
    } else {
      res.status(404).send({
        message: "Album not found or it is empty!",
      });
    }
  };

  public cancelPayment: RequestHandler = (req, res) => {
    res.status(200).send({
      message: "Payment is cancelled",
    });
  };
}

export default PaymentController;
