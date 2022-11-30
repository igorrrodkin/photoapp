import { connectS3 } from "./s3connection.js";
import { S3 } from "aws-sdk";

const s3 = connectS3();

interface listObjectsParams {
  Bucket: string;
  Prefix: string;
}

export const generateParams = (
  params: listObjectsParams,
  imageName: string
) => {
  const keyParam = `${params.Prefix}/${correctImageExtension(imageName)}`;
  return {
    Bucket: `images-photo-app`,
    Key: keyParam,
  };
};
export const correctImageExtension = (filename: string) => {
  const arr = filename.split(".");
  const lastItem = arr[arr.length - 1];
  if (lastItem == "png" || lastItem == "jpg" || lastItem == "jpeg") {
    return filename;
  } else {
    return `${filename}.jpeg`;
  }
};

export const listFolderObjects = async (params: listObjectsParams) => {
  const content: S3.ListObjectsOutput = await s3.listObjects(params).promise();
  const namesArr: (string | undefined)[] = content.Contents!.map(
    (item) => item.Key?.split("/")[2]
  );
  return namesArr;
};

export const getObjectBody = async (
  params: listObjectsParams,
  imageName: string
) => {
  const data: S3.GetObjectOutput = await s3
    .getObject(generateParams(params, imageName!))
    .promise();
  return data.Body;
};

// function for showing images in the browser.
// content - array of photo names
// returns array of encoded images in the <img> tag

// export const showImagesBase64 = async (
//   params: listObjectsParams,
//   namesArray: string[]
// ) => {
//   const base64images = namesArray.map(async (imgName) => {
//     const data: S3.GetObjectOutput = await s3
//       .getObject(generateParams(params, imgName!))
//       .promise();
//     let buf = Buffer.from(data.Body);
//     let base64 = buf.toString("base64");
//     return "<img src='data:image/jpeg;base64," + base64 + "'" + "/>";
//   });
//   return Promise.all(base64images);
// };
