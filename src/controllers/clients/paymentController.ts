import Stripe from "stripe";
import { RequestHandler } from "express";

import { availableAlbums } from "../../db/databaseApi.js";
import { extractLoginFromJWT } from "./authController.js";
import { getObjectBody, listFolderObjects } from "../../s3/s3api.js";
const secretAPIkey = process.env.STRIPE_SECRET as string;

const stripe = new Stripe(secretAPIkey, {
  apiVersion: "2022-11-15",
  typescript: true,
});

const URL = process.env.DEV_URL as string;

export const buyAlbum: RequestHandler = async (req, res, next) => {
  try {
    const [photographer, album]: string[] = [
      req.params.photographer,
      req.params.album,
    ];
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const albums = await availableAlbums(login);

      const currentAlbum = albums.find((item) => {
        return item.album_name == album && item.login == photographer;
      });
      if (currentAlbum) {
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: currentAlbum.price_id,
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
  } catch (e) {
    res.status(403).send({
      message: "Forbidden",
    });
  }
};

export const downloadImages: RequestHandler = async (req, res, next) => {
  try {
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
  } catch (e) {
    res.status(403).send({
      message: "Forbidden",
    });
  }
};

export const loadImage: RequestHandler = async (req, res, next) => {
  try {
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
  } catch (e) {
    res.status(403).send({
      message: "Forbidden",
    });
  }
};

export const cancelPayment: RequestHandler = (req, res, next) => {
  res.status(200).send({
    message: "Payment is cancelled",
  });
};
