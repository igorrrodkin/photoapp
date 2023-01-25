import { RequestHandler } from "express";
import Albums from "../../db/albums/Albums.js";
import S3Controller from "../../s3/S3Controller.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";
import { extractClientUUIDFromJWT } from "../../utils/jwt.js";
import Clients from "../../db/clients/Clients.js";
import Photos from "../../db/photos/Photos.js";

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
    // this.router.get(
    //   "/:photoid",
    //   authClients,
    //   catchAsync(this.showImageFullScreenWatermarked)
    // );
    // this.router.get(
    //   "/thankyou/:albumid",
    //   authClients,
    //   catchAsync(this.showImageFullScreen)
    // );
    this.router.get(
      "/:albumid",
      authClients,
      catchAsync(this.albumWatermarked)
    );
    this.router.get("/cancel", authClients, catchAsync(this.cancelPayment));
    this.router.get(
      "/thankyou/:albumid",
      authClients,
      catchAsync(this.successPayment)
    );
  };

  public allAlbumsWatermarked: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuid: string = extractClientUUIDFromJWT(token);
    const availablePhotos = await this.photos.getClientPhotos(uuid);
    if (availablePhotos.length) {
      const setContent = Array.from(
        new Set(
          availablePhotos.map((item) => {
            return item.albumUuid;
          })
        )
      );

      const mapped = setContent.map(async (uuid) => {
        const cover = await this.photos.getAlbumCover(uuid!);
        const albumData = await this.albums.getAlbumDataByUUID(uuid!);
        const photosByUUID = availablePhotos
          .filter((content) => content.albumUuid == uuid)
          .map((item) => {
            return {
              presignedWatermark: item.presignedWatermark,
              presignedMiniWatermark: item.presignedMiniWatermark,
            };
          });
        return {
          photographer: albumData.login,
          album: albumData.albumName,
          location: albumData.albumLocation,
          datapicker: albumData.datapicker,
          presignedCover: cover,
          availablePhotos: photosByUUID,
        };
      });
      const albumInfo = await Promise.all(mapped);

      res.status(400).send({
        message: "Your photos",
        photos: albumInfo,
      });
    } else {
      res.status(400).send({
        message: "Your photos will be dropped soon!",
      });
    }
  };

  public albumWatermarked: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuid: string = extractClientUUIDFromJWT(token);
    const albumId = req.params.albumid;
    const availablePhotos = await this.photos.getClientPhotosOneAlbum(
      uuid,
      albumId
    );
    if (availablePhotos.length) {
      const cover = await this.photos.getAlbumCover(albumId!);
      const albumData = await this.albums.getAlbumDataByUUID(albumId!);
      const mappedAlbumPhotosContent = availablePhotos.map((item) => {
        return {
          presignedWatermark: item.presignedWatermark,
          presignedMiniWatermark: item.presignedMiniWatermark,
        };
      });
      res.status(400).send({
        message: "Done",
        album: albumData.albumName,
        cover: cover,
        content: mappedAlbumPhotosContent,
      });
    } else {
      res.status(400).send({
        message: "You have not any photos in this album",
      });
    }
  };

  public successPayment: RequestHandler = async (req, res) => {
    res.status(200).send({
      message: "Thank you!",
    });
  };
  // public showImageFullScreenWatermarked: RequestHandler = async (req, res) => {
  //   const photoID = req.params.photoid;
  //   const photoData = await this.photos.getContentByPhotoUuidWatermarked(
  //     photoID
  //   );
  //   if (!photoData) {
  //     res.status(400).send({
  //       message: "Photo not found",
  //     });
  //   } else {
  //     res.status(400).send({
  //       photoData,
  //     });
  //   }
  // };
  // public showImageFullScreen: RequestHandler = async (req, res) => {
  //   const photoID = req.params.photoid;
  //   const photoData = await this.photos.getContentByPhotoUuidNormal(photoID);
  //   if (!photoData) {
  //     res.status(400).send({
  //       message: "Photo not found",
  //     });
  //   } else {
  //     res.status(400).send({
  //       photoData,
  //     });
  //   }
  // };

  public cancelPayment: RequestHandler = (req, res) => {
    res.status(200).send({
      message: "Payment is cancelled",
    });
  };
}
export default DashboardController;
