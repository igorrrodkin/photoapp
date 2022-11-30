import { RequestHandler } from "express";
import {
  ifAlbumExists,
  createAlbumDB,
  listAlbums,
  giveAccessToAlbum,
} from "../../db/databaseApi.js";
import { catchAsync } from "../../middleware/catchAsync.js";
import { createProduct } from "../../utils/payment.js";
import { extractLoginFromJWT } from "./authController.js";
import { albumCreation } from "../../types.js";

export const createAlbum: RequestHandler = catchAsync(
  async (req, res, next) => {
    const content: albumCreation = req.body;
    // date format dd-mm-yyyy
    const dateRegEx: RegExp = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g;
    if (!content.albumName || !content.location) {
      res.status(400).send({
        message: "Album name and location are required!",
      });
    } else if (!content.datapicker.match(dateRegEx)) {
      res.status(400).send({
        message: "Incorrect date format, it should be DD/MM/YYYY",
      });
    } else {
      const token: string = req.headers.authorization!.split(" ")[1];
      const login: string | undefined = extractLoginFromJWT(token);
      if (login) {
        const albumExists = await ifAlbumExists(login, content.albumName);
        if (albumExists) {
          res.status(400).send({
            message: "Album with this name already exists!",
          });
        } else {
          const [productData, priceData] = await createProduct(
            login,
            content.albumName,
            content.price
          );
          await createAlbumDB(
            login,
            content.albumName,
            content.location,
            content.datapicker,
            content.price,
            priceData.id,
            productData.id
          );
          res.status(200).send({
            message: "Successfully created!",
          });
        }
      } else {
        res.status(403).send({
          message: "Invalid login",
        });
      }
    }
  }
);

export const showAlbums: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization!.split(" ")[1];
  const login = extractLoginFromJWT(token);
  if (login) {
    const content = await listAlbums(login);
    if (content.rowCount) {
      const mappedContent = content.rows.map((item) => {
        return {
          album: item.album_name,
          location: item.album_location,
          datapicker: item.datapicker,
          price: item.price / 100 + "$",
        };
      });
      res.status(200).send({
        content: mappedContent,
      });
    } else {
      res.status(200).send({
        message: "You haven't any albums",
      });
    }
  } else {
    res.status(403).send({
      message: "Invalid login",
    });
  }
});

export const giveAccessToClients: RequestHandler = catchAsync(
  async (req, res, next) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const album = req.params.album;
      const clientLogins: string[] = req.body.giveAccessTo;
      if (!(await ifAlbumExists(login, album))) {
        res.status(404).send({
          message: "Album not found",
        });
      } else {
        await giveAccessToAlbum(login, album, clientLogins);
        res.status(200).send({
          message: "Access is given",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  }
);
