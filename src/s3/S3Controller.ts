import { S3 } from "aws-sdk";
import { v4 } from "uuid";
// interface listObjectsParams {
//   Bucket: string;
//   Prefix: string;
// }

export default class S3Controller {
  public constructor(private s3: S3) {}

  // public getObjectBody = async (
  //   params: listObjectsParams,
  //   imageName: string
  // ) => {
  //   let validImgName;
  //   const imgNameArr = imageName.split(".");
  //   const imgExtension = imgNameArr[imgNameArr.length - 1];
  //   if (
  //     imgExtension == "png" ||
  //     imgExtension == "jpg" ||
  //     imgExtension == "jpeg"
  //   ) {
  //     validImgName = imageName;
  //   } else {
  //     validImgName = `${imageName}.jpeg`;
  //   }
  //   const key = `${params.Prefix}/${validImgName}`;
  //   const validParams = {
  //     Bucket: `images-photo-app`,
  //     Key: key,
  //   };
  //   const data: S3.GetObjectOutput = await this.s3
  //     .getObject(validParams)
  //     .promise();
  //   return data.Body;
  // };

  public generatePhotosPresigned = async (
    bucketName: string,
    loginPhotographer: string,
    albumName: string,
    contentType: string,
    filename: string
  ) => {
    const params = {
      Bucket: bucketName,
      Key: `${loginPhotographer}/${albumName}/${v4()}_${filename}.${
        contentType.split("/")[1]
      }`,
      ContentType: contentType,
      Tagging: "random=random",
    };
    const signedUrl = this.s3.getSignedUrl("putObject", params);
    return signedUrl;
  };

  public generateSefiesPresigned = async (
    bucketName: string,
    clientId: string,
    contentType: string
  ) => {
    const params = {
      Bucket: bucketName,
      Key: `${clientId}/${v4()}.${contentType.split("/")[1]}`,

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
