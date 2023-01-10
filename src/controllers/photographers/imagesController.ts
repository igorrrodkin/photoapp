import { extractLoginFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import { authPhotographers } from "../../utils/authMiddleware.js";
import Albums from "../../db/albums/Albums.js";
import S3Controller from "../../s3/S3Controller.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import Clients from "../../db/clients/Clients.js";
import Photos from "../../db/photos/Photos.js";
import axios from "axios";
// import { reqPresignedUrl } from "../../dtos/interfaces.js";

const bucketPhotos = process.env.BUCKET_PHOTOS;
// const bucketPhotosWatermarked = process.env.BUCKET_PHOTOS_WATERMARKED;
// const bucketPhotosMiniature = process.env.BUCKET_PHOTOS_MINIATURE;
// const bucketPhotosMiniatureWatermarked =
//   process.env.BUCKET_PHOTOS_MINIATURE_WATERMARKED;

class ImagesController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly albums: Albums,
    public readonly clients: Clients,
    public readonly photos: Photos,
    public readonly s3: S3Controller
  ) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    // this.router.get("/:album", authPhotographers, catchAsync(this.listImages));
    this.router.post("/:album/upload", authPhotographers, this.uploadImages);
    this.router.post(
      "/giveaccess",
      authPhotographers,
      catchAsync(this.giveAccessToClients)
    );
  };
  public uploadImages: RequestHandler = async (req, res) => {
    const img = req.body;
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    const albumName = req.params.album;
    if (await this.albums.ifAlbumExists(login, albumName)) {
      const presigned = await this.s3.generatePhotosPresigned(
        bucketPhotos,
        login,
        albumName,
        // req.body.contentType
        "image/jpg",
        "filename"
      );
      const response = await axios.put(
        presigned,
        { data: img },
        {
          headers: { "Content-Type": "image/jpg" },
        }
      );
      // const presignedWatermarked = await this.s3.generatePhotosPresigned(
      //   bucketPhotosWatermarked,
      //   login,
      //   albumName,
      //   req.body.contentType
      // );

      // const presignedMiniature = await this.s3.generatePhotosPresigned(
      //   bucketPhotosMiniature,
      //   login,
      //   albumName,
      //   req.body.contentType
      // );

      // const presignedWatermarkedMiniature =
      //   await this.s3.generatePhotosPresigned(
      //     bucketPhotosMiniatureWatermarked,
      //     login,
      //     albumName,
      //     req.body.contentType
      //   );
      res.status(200).send({
        message: "Presigned urls for uploading photos",
        presigned,
        response,
        // presignedMiniature,
        // presignedWatermarked,
        // presignedWatermarkedMiniature,
      });
    } else {
      res.status(404).send({
        message: "Album not found",
      });
    }
  };
  public giveAccessToClients: RequestHandler = async (req, res) => {
    const photoUuid: string = req.body.photoUuid;
    const clientsUUIDsArray: string[] = req.body.clientsArray;
    const photoExists = await this.photos.findPhotoByUuid(photoUuid);
    if (!clientsUUIDsArray || clientsUUIDsArray.length == 0) {
      res.status(403).send({
        message: "You haven't typed any client's UUID",
      });
    } else if (!photoExists) {
      res.status(404).send({
        messsage: "Can't find this photo",
      });
    } else {
      clientsUUIDsArray.map(async (uuid) => {
        if (await this.clients.ifClientNumberNotExists(uuid)) {
          await this.clients.registerClient(uuid);
        }
        await this.photos.giveAccessToPhoto(uuid, photoUuid);
      });
      res.status(200).send({ message: "Done!" });
    }
  };
  // public uploadImages: RequestHandler = catchAsync(async (req, res) => {
  // const token = req.headers.authorization!.split(" ")[1];
  // const login: string = extractLoginFromJWT(token);
  //   const bucketName = process.env.BUCKET_NAME_S3;
  //   if (login) {
  // const albumName = req.params.album;
  //     const body: reqPresignedUrl = req.body;
  //     const folderName = `albums/${login}-${albumName}/`;
  //     const folderNameWatermarked = `albums-watermarked/${login}-${albumName}/`;
  // if (await this.albums.ifAlbumExists(login, albumName)) {
  //       const [signedUrl, combinedTags] = await this.s3.generatePresigned(
  //         bucketName,
  //         folderName,
  //         login,
  //         body
  //       );
  //       const signedUrlWatermarked = await this.s3.generatePresignedWatermarked(
  //         bucketName,
  //         folderNameWatermarked,
  //         login,
  //         body
  //       );

  //       res.status(200).json({
  //         // contentType: JSON.parse(Object.keys(req.body)[0]).contentType,
  //         contentType: req.body.contentType,
  //         method: "put",
  //         signedUrl,
  //         signedUrlWatermarked,
  //         fields: {},
  //         headers: { "x-amz-tagging": combinedTags },
  //       });
  //     } else {
  //       res.status(404).send({
  //         message: "Album not found",
  //       });
  //     }
  //   } else {
  //     res.status(403).send({
  //       message: "Invalid login",
  //     });
  //   }
  // });
}

export default ImagesController;
