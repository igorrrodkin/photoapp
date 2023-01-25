import { extractLoginFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import { authPhotographers } from "../../utils/authMiddleware.js";
import Albums from "../../db/albums/Albums.js";
import S3Controller from "../../s3/S3Controller.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import Clients from "../../db/clients/Clients.js";
import Photos from "../../db/photos/Photos.js";
import { v4 } from "uuid";
// import { reqPresignedUrl } from "../../dtos/interfaces.js";

const bucketPhotos = process.env.BUCKET_PHOTOS;

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
    this.router.post(
      "/:albumuuid/upload",
      authPhotographers,
      catchAsync(this.uploadImages)
    );
    this.router.post(
      "/giveaccess",
      authPhotographers,
      catchAsync(this.giveAccessToClients)
    );
  };
  public uploadImages: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    const albumUUID = req.params.albumuuid;
    const albumData = await this.albums.getAlbumDataByUUID(albumUUID);
    // const albumUUID = await this.albums.getUUIDByLoginAndAlbumName(
    //   login,
    //   albumName
    // );
    if (albumData) {
      const presigned = await this.s3.generatePhotosPresignedPut(
        bucketPhotos,
        login,
        albumUUID,
        req.body.photoExtension,
        v4()
      );

      res.status(200).send({
        presigned,
      });
    } else {
      res.status(404).send({
        message: "Album not found",
      });
    }
  };
  public giveAccessToClients: RequestHandler = async (req, res) => {
    const photoUuid: string = req.body.photoUuid;
    const clientNumberArray: string[] = req.body.clientsArray;
    const photoExists = await this.photos.findPhotoByUuid(photoUuid);
    if (!clientNumberArray || clientNumberArray.length == 0) {
      res.status(403).send({
        message: "You haven't typed any client's UUID",
      });
    } else if (!photoExists) {
      res.status(404).send({
        messsage: "Can't find this photo",
      });
    } else {
      clientNumberArray.map(async (number) => {
        if (await this.clients.ifClientNumberNotExists(number)) {
          await this.clients.registerClient(number);
        }
        const clientUUID = await this.clients.getUUIDbyNumber(number);
        await this.photos.giveAccessToPhoto(clientUUID!, photoUuid);
      });
      res.status(200).send({ message: "Done!" });
    }
  };
}

export default ImagesController;
