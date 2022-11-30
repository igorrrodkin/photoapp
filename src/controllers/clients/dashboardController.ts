import { RequestHandler } from "express";
import { extractLoginFromJWT } from "./authController.js";
import { availableAlbums, ifAlbumExists } from "../../db/databaseApi.js";
import { listFolderObjects } from "../../s3/s3api.js";
import { catchAsync } from "../../middleware/catchAsync.js";

export const getAvailableAlbums: RequestHandler = catchAsync(
  async (req, res, next) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    let content = await availableAlbums(login);
    if (content) {
      const contentFiltered = content.map((item) => {
        return {
          album: item.album_name,
          photographer: item.login,
          location: item.album_location,
          datapicker: item.datapicker,
          price: +item.price / 100 + "$",
        };
      });
      res.status(200).send({ content: contentFiltered });
    } else {
      res.status(200).send({ message: "You haven't access to any album" });
    }
  }
);

export const listDashboardImages: RequestHandler = catchAsync(
  async (req, res, next) => {
    const albumName = req.params.album;
    const loginPhotographer = req.params.photographer;
    if (await ifAlbumExists(loginPhotographer, albumName)) {
      const bucketName = process.env.BUCKET_NAME_S3 as string;
      const folderName = `albums-watermarked/${loginPhotographer}-${albumName}/`;
      const params = {
        Bucket: bucketName,
        Prefix: folderName,
      };
      const contentResponse = await listFolderObjects(params);
      res.status(200).send({
        message: "done!",
        content: contentResponse,
      });
    } else {
      res.status(404).send({
        message: "Album not found",
      });
    }
  }
);
