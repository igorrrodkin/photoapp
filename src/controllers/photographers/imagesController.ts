import { extractLoginFromJWT } from "./authController.js";
import { RequestHandler } from "express";

import { ifAlbumExists } from "../../db/databaseApi.js";
import { connectS3 } from "../../s3/s3connection.js";
import { listFolderObjects } from "../../s3/s3api.js";
import { catchAsync } from "../../middleware/catchAsync.js";

const s3 = connectS3();
export const uploadImages: RequestHandler = catchAsync(
  async (req, res, next) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    if (login) {
      const albumName = req.params.album;
      const bucketName = process.env.BUCKET_NAME_S3;
      const folderName = `albums/${login}-${albumName}/`;
      const folderNameWatermarked = `albums-watermarked/${login}-${albumName}/`;

      if (await ifAlbumExists(login, albumName)) {
        let metaName = "";
        // if (JSON.parse(Object.keys(req.body)[0]).metadata.name === "") {
        if (req.body.metadata.name === "") {
          //   metaName = JSON.parse(Object.keys(req.body)[0]).filename;
          metaName = req.body.filename;
        } else {
          // metaName = JSON.parse(Object.keys(req.body)[0]).metadata.name;
          metaName = req.body.metadata.name;
        }
        var metaCaption = "";
        // if (!JSON.parse(Object.keys(req.body)[0]).metadata.caption) {
        if (!req.body.metadata.caption) {
          metaCaption = "";
        } else {
          // metaCaption = JSON.parse(Object.keys(req.body)[0]).metadata.caption;
          metaCaption = req.body.metadata.caption;
        }
        let tag1 = "fileName=" + metaName;
        let tag2 = "";
        if (metaCaption) {
          tag2 = "fileDescription=" + metaCaption;
        } else {
          tag2 = "";
        }
        const tags = tag1 + "&" + tag2;
        const combinedTags = String(tags);
        const params = {
          Metadata: {
            fileName: metaName, // add the user-input filename as the value for the 'fileName' metadata key
            caption: metaCaption, // add the user-input caption as the value for the 'caption' metadata key
            user: login, // let's grab the user who uploaded this and use the username as the value with the 'user' key
            uploadDateUTC: Date(), // and let's grab the UTC date the file was uploaded
          },
          Bucket: bucketName,
          // Key: folderName + `${JSON.parse(Object.keys(req.body)[0]).filename}`,
          Key: folderName + `${req.body.filename}`,
          // ContentType: JSON.parse(Object.keys(req.body)[0]).contentType,

          ContentType: req.body.contentType,
          Tagging: "random=random",
        };
        const paramsWatermarked = {
          Metadata: {
            fileName: metaName, // add the user-input filename as the value for the 'fileName' metadata key
            caption: metaCaption, // add the user-input caption as the value for the 'caption' metadata key
            user: login, // let's grab the user who uploaded this and use the username as the value with the 'user' key
            uploadDateUTC: Date(), // and let's grab the UTC date the file was uploaded
          },
          Bucket: bucketName,
          // Key: folderNameWatermarked + `${JSON.parse(Object.keys(req.body)[0]).filename}`,
          Key: folderNameWatermarked + `${req.body.filename}`,
          // ContentType: JSON.parse(Object.keys(req.body)[0]).contentType,

          ContentType: req.body.contentType,
          Tagging: "random=random",
        };
        const signedUrl = s3.getSignedUrl("putObject", params);
        const signedUrlWatermarked = s3.getSignedUrl(
          "putObject",
          paramsWatermarked
        );

        res.status(200).json({
          // contentType: JSON.parse(Object.keys(req.body)[0]).contentType,
          contentType: req.body.contentType,
          method: "put",
          signedUrl,
          signedUrlWatermarked,
          fields: {},
          headers: { "x-amz-tagging": combinedTags },
        });
      } else {
        res.status(404).send({
          message: "Album not found",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  }
);

export const listImages: RequestHandler = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization!.split(" ")[1];
  const login: string = extractLoginFromJWT(token);
  if (login) {
    const albumName = req.params.album;

    if (await ifAlbumExists(login, albumName)) {
      const bucketName = process.env.BUCKET_NAME_S3 as string;
      const folderName = `albums-watermarked/${login}-${albumName}`;
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
  } else {
    res.status(403).send({
      message: "Invalid login",
    });
  }
});
