import { db } from "../db/connection.js";
import convert from "heic-convert";
import { connectS3 } from "../s3/s3connection.js";
import { S3Event } from "aws-lambda";
import { PgDatabase } from "drizzle-orm-pg";
import S3Controller from "../s3/S3Controller.js";
import Selfies from "../db/selfies/Selfies.js";

export const handler = async (event: S3Event): Promise<void> => {
  const client: PgDatabase = await db.connect();
  const s3 = connectS3();
  const s3controller = new S3Controller(s3);
  const selfies = new Selfies(client);
  console.log("Connected to S3Storage and Postgres");
  console.log("Received event:", JSON.stringify(event, null, 2));
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const clientId = key.split("/")[0];
  const photoId = key.split("/")[1];
  const [photoIdWithoutExtension, photoExtension] = photoId.split(".");
  const imgData = await s3
    .getObject({
      Bucket: process.env.BUCKET_SELFIES,
      Key: key,
    })
    .promise();
  const imageBody = imgData.Body as Buffer;

  if (photoExtension == "heic") {
    console.log("Converting heic...");
    const bufferConverted = await convert({
      buffer: imageBody,
      format: "JPEG",
      quality: 1,
    });
    const validFormatKey = `${clientId}/${photoIdWithoutExtension}.jpeg`;
    await s3
      .putObject({
        Bucket: process.env.BUCKET_SELFIES,
        Key: validFormatKey,
        Body: bufferConverted,
        ContentType: "image",
      })
      .promise();
  } else {
    const signedUrlSelfies = s3controller.generatePresignedGet(
      process.env.BUCKET_SELFIES,
      key
    );
    const selfiesExists: boolean = await selfies.clientSelfiesExists(clientId);
    if (selfiesExists) {
      await selfies.updateFrontPhotosByClientUUID(clientId);
    }
    await selfies.insertPhotoContent(clientId, signedUrlSelfies, photoId);
    console.log("Selfies uploaded");
  }
};
