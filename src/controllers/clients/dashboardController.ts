import { RequestHandler } from "express";
import Albums from "../../db/albums/Albums.js";
import S3Controller from "../../s3/S3Controller.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";
import { extractClientUUIDFromJWT } from "../../utils/jwt.js";
import Clients from "../../db/clients/Clients.js";
import Photos from "../../db/photos/Photos.js";
import { photoContent } from "../../dtos/interfaces.js";

class DashboardController extends Controller {
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
    this.router.get("/", authClients, catchAsync(this.allAlbumsWatermarked));
    this.router.get(
      "/:album",
      authClients,
      catchAsync(this.showAlbumImagesWatermarked)
    );
    this.router.get(
      "/:photoid",
      authClients,
      catchAsync(this.showImageFullScreenWatermarked)
    );
  };

  public allAlbumsWatermarked: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuid: string = extractClientUUIDFromJWT(token);
    const availablePhotos = await this.clients.getAvailablePhotosByClientID(
      uuid
    );
    if (!availablePhotos) {
      res.status(400).send({
        message: "Your photos will be dropped soon!",
      });
    } else {
      const parsedPhotos: string[] = JSON.parse(availablePhotos);
      const mappedContent: photoContent[] = await Promise.all(
        parsedPhotos.map(async (photoUuid: string) => {
          const photoContent: photoContent =
            await this.photos.getContentByPhotoUuidWatermarked(photoUuid);
          return photoContent;
        })
      );
      const filterNullValues = mappedContent.filter((item) => item != null);
      const photosValidFormat = filterNullValues.reduce(
        (result: any, a: any) => {
          result[a.albumName] = result[a.albumName] || [];
          result[a.albumName].push(a.presignedMiniWatermark);
          return result;
        },
        {}
      );
      res.status(200).send({
        message: "Your photodrop",
        content: photosValidFormat,
      });
    }
  };

  public showAlbumImagesWatermarked: RequestHandler = async (req, res) => {
    const albumName = req.params.album;
    const token = req.headers.authorization!.split(" ")[1];
    const uuid: string = extractClientUUIDFromJWT(token);
    const availablePhotos = await this.clients.getAvailablePhotosByClientID(
      uuid
    );
    if (!availablePhotos) {
      res.status(400).send({
        message: "Your photos will be dropped soon!",
      });
    } else {
      const parsedPhotos: string[] = JSON.parse(availablePhotos);
      const mappedContent: photoContent[] = await Promise.all(
        parsedPhotos.map(async (photoUuid: string) => {
          const photoContent: photoContent =
            await this.photos.getContentByPhotoUuidWatermarked(photoUuid);
          return photoContent;
        })
      );
      const filterNullValues = mappedContent.filter((item) => item != null);
      const photosValidFormat = filterNullValues.reduce(
        (result: any, a: any) => {
          result[a.albumName] = result[a.albumName] || [];
          result[a.albumName].push(a.presignedMiniWatermark);
          return result;
        },
        {}
      );
      const albumPhotos = photosValidFormat[albumName];
      if (!albumPhotos) {
        res.status(404).send({
          message: "Album not found or there are no photos with you in it",
        });
      } else {
        res.status(200).send({
          message: "Your photodrop",
          album: albumName,
          content: photosValidFormat[albumName],
        });
      }
    }
  };
  public showImageFullScreenWatermarked: RequestHandler = async (req, res) => {
    const photoID = req.params.photoid;
    const photoData = await this.photos.getContentByPhotoUuidWatermarked(
      photoID
    );
    const presignedWatermarked = photoData.presignedWatermark;
    if (!presignedWatermarked) {
      res.status(400).send({
        message: "Photo not found",
      });
    } else {
      res.status(400).send({
        presignedWatermarked,
      });
    }
  };
}
export default DashboardController;
