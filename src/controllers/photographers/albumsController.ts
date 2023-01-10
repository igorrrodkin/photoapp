import { RequestHandler } from "express";
import Albums from "../../db/albums/Albums.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { extractLoginFromJWT } from "../../utils/jwt.js";
import { albumCreation } from "../../dtos/interfaces.js";
import { authPhotographers } from "../../utils/authMiddleware.js";
import Controller from "../Controller.js";
import { dateValidator } from "../../dtos/validation/dateValidator.js";
import S3Controller from "../../s3/S3Controller.js";

// const coversBucket = process.env.BUCKET_COVERS;

class AlbumsController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly albums: Albums,
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
    // this.router.post(
    //   ":album/setcover",
    //   authPhotographers,
    //   catchAsync(this.setCoverPhoto)
    // );
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
          content.datapicker
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
    const content = await this.albums.listAlbums(login);
    if (content.length) {
      res.status(200).send({
        content,
      });
    } else {
      res.status(200).send({
        message: "You haven't any albums",
      });
    }
  };

  // public setCoverPhoto: RequestHandler = async (req, res) => {
  //   const albumName = req.params.album;
  //   const token = req.headers.authorization!.split(" ")[1];
  //   const login = extractLoginFromJWT(token);
  //   if (!(await this.albums.ifAlbumExists(login, albumName))) {
  //     res.status(400).send({
  //       message: "Album not exists",
  //     });
  //   } else {
  //     const coverPresigned = await this.s3.generatePhotosPresigned(
  //       coversBucket,
  //       login,
  //       albumName,
  //       req.body.contentType,
  //       "filename2"
  //     );
  //     res.status(200).send({
  //       coverPresigned,
  //     });
  //   }
  // };
}

export default AlbumsController;
