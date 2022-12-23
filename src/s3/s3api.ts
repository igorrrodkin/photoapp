import { S3 } from "aws-sdk";
import { reqPresignedUrl } from "../dtos/interfaces.js";

interface listObjectsParams {
  Bucket: string;
  Prefix: string;
}

export default class S3Controller {
  public constructor(private s3: S3) {}

  public getObjectBody = async (
    params: listObjectsParams,
    imageName: string
  ) => {
    let validImgName;
    const imgNameArr = imageName.split(".");
    const imgExtension = imgNameArr[imgNameArr.length - 1];
    if (
      imgExtension == "png" ||
      imgExtension == "jpg" ||
      imgExtension == "jpeg"
    ) {
      validImgName = imageName;
    } else {
      validImgName = `${imageName}.jpeg`;
    }
    const key = `${params.Prefix}/${validImgName}`;
    const validParams = {
      Bucket: `images-photo-app`,
      Key: key,
    };
    const data: S3.GetObjectOutput = await this.s3
      .getObject(validParams)
      .promise();
    return data.Body;
  };

  public listFolderObjects = async (params: listObjectsParams) => {
    const content: S3.ListObjectsOutput = await this.s3
      .listObjects(params)
      .promise();
    const namesArr: (string | undefined)[] = content.Contents!.map(
      (item) => item.Key?.split("/")[2]
    );
    return namesArr;
  };

  public generatePresigned = async (
    bucketName: string,
    folder: string,
    user: string,
    request: reqPresignedUrl
  ) => {
    let metaName = "";
    // if (JSON.parse(Object.keys(req.body)[0]).metadata.name === "") {
    if (request.metadata.name === "") {
      //   metaName = JSON.parse(Object.keys(req.body)[0]).filename;
      metaName = request.filename;
    } else {
      // metaName = JSON.parse(Object.keys(req.body)[0]).metadata.name;
      metaName = request.metadata.name;
    }
    let metaCaption = "";
    // if (!JSON.parse(Object.keys(req.body)[0]).metadata.caption) {
    if (request.metadata.caption) {
      metaCaption = "";
    } else {
      // metaCaption = JSON.parse(Object.keys(req.body)[0]).metadata.caption;
      metaCaption = request.metadata.caption;
    }
    const tag1 = "fileName=" + metaName;
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
        user: user, // let's grab the user who uploaded this and use the username as the value with the 'user' key
        uploadDateUTC: Date(), // and let's grab the UTC date the file was uploaded
      },
      Bucket: bucketName,
      // Key: folderName + `${JSON.parse(Object.keys(req.body)[0]).filename}`,
      Key: folder + `${request.filename}`,
      // ContentType: JSON.parse(Object.keys(req.body)[0]).contentType,

      ContentType: request.contentType,
      Tagging: "random=random",
    };

    const signedUrl = this.s3.getSignedUrl("putObject", params);
    return [signedUrl, combinedTags];
  };

  public generatePresignedWatermarked = async (
    bucketName: string,
    folderWatermarked: string,
    user: string,
    request: reqPresignedUrl
  ) => {
    let metaName = "";
    // if (JSON.parse(Object.keys(req.body)[0]).metadata.name === "") {
    if (request.metadata.name === "") {
      //   metaName = JSON.parse(Object.keys(req.body)[0]).filename;
      metaName = request.filename;
    } else {
      // metaName = JSON.parse(Object.keys(req.body)[0]).metadata.name;
      metaName = request.metadata.name;
    }
    let metaCaption = "";
    // if (!JSON.parse(Object.keys(req.body)[0]).metadata.caption) {
    if (!request.metadata.caption) {
      metaCaption = "";
    } else {
      // metaCaption = JSON.parse(Object.keys(req.body)[0]).metadata.caption;
      metaCaption = request.metadata.caption;
    }

    const paramsWatermarked = {
      Metadata: {
        fileName: metaName, // add the user-input filename as the value for the 'fileName' metadata key
        caption: metaCaption, // add the user-input caption as the value for the 'caption' metadata key
        user: user, // let's grab the user who uploaded this and use the username as the value with the 'user' key
        uploadDateUTC: Date(), // and let's grab the UTC date the file was uploaded
      },
      Bucket: bucketName,
      // Key: folderNameWatermarked + `${JSON.parse(Object.keys(req.body)[0]).filename}`,
      Key: folderWatermarked + `${request.filename}`,
      // ContentType: JSON.parse(Object.keys(req.body)[0]).contentType,

      ContentType: request.contentType,
      Tagging: "random=random",
    };
    const signedUrlWatermarked = this.s3.getSignedUrl(
      "putObject",
      paramsWatermarked
    );
    return signedUrlWatermarked;
  };

  public generateSefiesPresigned = async (
    bucketName: string,
    user: string,
    request: reqPresignedUrl
  ) => {
    const folderName = `selfies/${user}/`;

    let metaName = "";
    // if (JSON.parse(Object.keys(req.body)[0]).metadata.name === "") {
    if (request.metadata.name === "") {
      //   metaName = JSON.parse(Object.keys(req.body)[0]).filename;
      metaName = request.filename;
    } else {
      // metaName = JSON.parse(Object.keys(req.body)[0]).metadata.name;
      metaName = request.metadata.name;
    }
    let metaCaption = "";
    // if (!JSON.parse(Object.keys(req.body)[0]).metadata.caption) {
    if (!request.metadata.caption) {
      metaCaption = "";
    } else {
      // metaCaption = JSON.parse(Object.keys(req.body)[0]).metadata.caption;
      metaCaption = request.metadata.caption;
    }
    const tag1 = "fileName=" + metaName;
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
        user: user, // let's grab the user who uploaded this and use the username as the value with the 'user' key
        uploadDateUTC: Date(), // and let's grab the UTC date the file was uploaded
      },
      Bucket: bucketName,
      // Key: folderName + `${JSON.parse(Object.keys(req.body)[0]).filename}`,
      Key: folderName + `${request.filename}`,
      // ContentType: JSON.parse(Object.keys(req.body)[0]).contentType,

      ContentType: request.contentType,
      Tagging: "random=random",
    };
    const signedUrl = this.s3.getSignedUrl("putObject", params);
    return [signedUrl, combinedTags];
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
