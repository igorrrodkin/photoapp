import { S3 } from "aws-sdk";
// import { v4 } from "uuid";
// interface listObjectsParams {
//   Bucket: string;
//   Prefix: string;
// }

export default class S3Controller {
  public constructor(private s3: S3) {}

  public generatePhotosPresignedPut = async (
    bucketName: string,
    loginPhotographer: string,
    albumName: string,
    contentType: string,
    filename: string
  ) => {
    const params = {
      Bucket: bucketName,
      Key: `${loginPhotographer}/${albumName}/${filename}.${
        contentType.split("/")[1]
      }`,
      ContentType: contentType,
      Tagging: "random=random",
    };
    const signedUrl = this.s3.getSignedUrl("putObject", params);
    return signedUrl;
  };
  public generatePresignedGet = (bucketName: string, key: string) => {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: 604800,
    };
    const signedUrl = this.s3.getSignedUrl("getObject", params);
    return signedUrl;
  };

  public putImage = async (bucketName: string, key: string, body: S3.Body) => {
    await this.s3
      .putObject({
        Body: body,
        Bucket: bucketName,
        Key: key,
        ContentType: "image",
      })
      .promise();
    return;
  };

  public generateSefiesPresigned = async (
    bucketName: string,
    clientId: string,
    contentType: string,
    photoUuid: string
  ) => {
    const params = {
      Bucket: bucketName,
      Key: `${clientId}/${photoUuid}.${contentType.split("/")[1]}`,

      ContentType: contentType,
      Tagging: "random=random",
    };
    const signedUrl = this.s3.getSignedUrl("putObject", params);
    return signedUrl;
  };
}

// function for showing images in the browser.
// content - array of photo names
// returns array of encoded images in the <img> tag

// export const showImagesBase64 = async (
//   params: listObjectsParams,
//   namesArray: string[]
// ) => {
//   const base64images = namesArray.map(async (imgName) => {
//       const data: S3.GetObjectOutput = await s3
//           .getObject(generateParams(params, imgName!))
//           .promise();
//     let buf = Buffer.from(data.Body as Readable);
//     let base64 = buf.toString("base64");
//     return "<img src='data:image/jpeg;base64," + base64 + "'" + "/>";
//   });
//   return Promise.all(base64images);
// };
