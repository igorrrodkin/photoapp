import { db } from "../db/connection.js";
import convert from "heic-convert";
import { connectS3 } from "../s3/s3connection.js";
import { S3Event } from "aws-lambda";
import { PgDatabase } from "drizzle-orm-pg";
import S3Controller from "../s3/S3Controller.js";
import {
  putWatermark,
  resizeToCover,
  resizeToMiniatureWatermarked,
  resizeToMiniaure,
} from "../utils/sharpHandler.js";
import Photos from "../db/photos/Photos.js";

export const handler = async (event: S3Event): Promise<void> => {
  const client: PgDatabase = await db.connect();
  const s3 = connectS3();
  const s3controller = new S3Controller(s3);
  const photos = new Photos(client);
  console.log("Connected to S3Storage and Postgres");
  console.log("Received event:", JSON.stringify(event, null, 2));
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const photographerLogin = key.split("/")[0];
  const albumId = key.split("/")[1];
  const photoId = key.split("/")[2];
  const [photoIdWithoutExtension, photoExtension] = photoId.split(".");
  const imgData = await s3
    .getObject({
      Bucket: process.env.BUCKET_PHOTOS,
      Key: key,
    })
    .promise();
  const imageBody = imgData.Body as Buffer;

  if (photoExtension == "heic") {
    const bufferConverted = await convert({
      buffer: imageBody,
      format: "JPEG",
      quality: 1,
    });
    const validFormatKey = `${photographerLogin}/${albumId}/${photoIdWithoutExtension}.jpeg`;
    await s3
      .putObject({
        Bucket: process.env.BUCKET_PHOTOS,
        Key: validFormatKey,
        Body: bufferConverted,
        ContentType: "image",
      })
      .promise();
  } else {
    const watermarkPhotodropData = await s3
      .getObject({
        Bucket: process.env.BUCKET_PHOTOS,
        Key: "watermark_thumbnail.png",
      })
      .promise();
    const watermarkBody = watermarkPhotodropData.Body as Buffer;

    console.log("Creatimg presigned urls");
    const signedUrl = s3controller.generatePresignedGet(
      process.env.BUCKET_PHOTOS,
      key
    );
    const signedUrlMiniature = s3controller.generatePresignedGet(
      process.env.BUCKET_PHOTOS_MINIATURE,
      key
    );
    const signedUrlWatermarked = s3controller.generatePresignedGet(
      process.env.BUCKET_PHOTOS_WATERMARKED,
      key
    );
    const signedUrlMiniatureWatermarked = s3controller.generatePresignedGet(
      process.env.BUCKET_PHOTOS_MINIATURE_WATERMARKED,
      key
    );
    console.log("Created presigned urls");

    let isCoverPhoto: boolean;
    let signedUrlCover: string | null;
    const albumCoverExists = await photos.checkIfAlbumContainsPhotos(albumId);

    if (albumCoverExists) {
      console.log("Cover for this album already exists");
      isCoverPhoto = false;
      signedUrlCover = null;
    } else {
      isCoverPhoto = true;
      signedUrlCover = s3controller.generatePresignedGet(
        process.env.BUCKET_COVERS,
        key
      );
      const bufferCover = await resizeToCover(imageBody);
      await s3controller.putImage(process.env.BUCKET_COVERS, key, bufferCover);
    }
    const bufferWithWatermark = await putWatermark(imageBody, watermarkBody);
    await s3controller.putImage(
      process.env.BUCKET_PHOTOS_WATERMARKED,
      key,
      bufferWithWatermark
    );
    const bufferMiniature = await resizeToMiniaure(imageBody);
    await s3controller.putImage(
      process.env.BUCKET_PHOTOS_MINIATURE,
      key,
      bufferMiniature
    );
    const bufferMiniatureWatermarked = await resizeToMiniatureWatermarked(
      imageBody,
      watermarkBody
    );
    await s3controller.putImage(
      process.env.BUCKET_PHOTOS_MINIATURE_WATERMARKED,
      key,
      bufferMiniatureWatermarked
    );
    console.log("Images were uploaded");
    photos.insertPhotoInformation(
      photographerLogin,
      photoId,
      albumId,
      isCoverPhoto,
      signedUrl,
      signedUrlMiniature,
      signedUrlMiniatureWatermarked,
      signedUrlWatermarked,
      signedUrlCover!
    );
    console.log("photo content is inserted to psql");
  }
};
