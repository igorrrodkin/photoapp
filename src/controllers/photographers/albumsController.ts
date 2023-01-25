import { RequestHandler } from "express";
import Albums from "../../db/albums/Albums.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { extractLoginFromJWT } from "../../utils/jwt.js";
import { albumCreation } from "../../dtos/interfaces.js";
import { authPhotographers } from "../../utils/authMiddleware.js";
import Controller from "../Controller.js";
import { dateValidator } from "../../dtos/validation/dateValidator.js";
import S3Controller from "../../s3/S3Controller.js";
import Photos from "../../db/photos/Photos.js";
import { v4 } from "uuid";
// const coversBucket = process.env.BUCKET_COVERS;

class AlbumsController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly albums: Albums,
    public readonly photos: Photos,
    public readonly s3: S3Controller
  ) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.get("/", authPhotographers, catchAsync(this.showAlbums));
    this.router.post(
      "/create",
      authPhotographers,
      catchAsync(this.createAlbum)
    );
  };

  public createAlbum: RequestHandler = async (req, res) => {
    const content: albumCreation = req.body;
    if (!content.albumName || !content.location) {
      res.status(400).send({
        message: "Album name and location are required!",
      });
    } else if (!content.datapicker.match(dateValidator)) {
      res.status(400).send({
        message: "Incorrect date format, it should be DD/MM/YYYY",
      });
    } else {
      const token: string = req.headers.authorization!.split(" ")[1];
      const login: string = extractLoginFromJWT(token);
      const albumExists = await this.albums.ifAlbumExists(
        login,
        content.albumName
      );
      if (albumExists) {
        res.status(400).send({
          message: "Album with this name already exists!",
        });
      } else {
        await this.albums.createAlbumDB(
          login,
          content.albumName,
          content.location,
          content.datapicker,
          v4()
        );
        res.status(200).send({
          message: "Successfully created!",
        });
      }
    }
  };

  public showAlbums: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    const albumContent = await this.albums.listAlbums(login);
    if (albumContent.length) {
      const albumContentMapped = albumContent.map((item) => {
        return {
          album: item.albumName,
          location: item.albumLocation,
        };
      });
      // const fullContent = await this.photos.getPhotographerContent(login);
      // const mappedContent = albumContent.map((item) => {
      //   const albumContent = fullContent.filter(
      //     (element) =>
      //       element.albumUuid == item.albumUuid && element.accessClients == null
      //   );
      //   const coverPresigned = albumContent.find(
      //     (data) => data.coverPhoto == true && data.accessClients == null
      //   )?.presignedCover;
      //   const presignedMiniForAlbum = albumContent.map((content) => {
      //     return content.presignedMini;
      //   });
      //   const presignedForAlbum = albumContent.map((content) => {
      //     return content.presignedNormal;
      //   });
      //   return {
      //     album: item.albumName,
      //     coverPhoto: coverPresigned,
      //     photosDefault: presignedForAlbum,
      //     photosMini: presignedMiniForAlbum,
      //   };
      // });
      res.status(200).send({
        content: albumContentMapped,
      });
    } else {
      res.status(200).send({
        message: "You haven't any albums",
      });
    }
  };
}

export default AlbumsController;
