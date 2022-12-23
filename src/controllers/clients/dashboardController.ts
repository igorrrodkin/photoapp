import { RequestHandler } from "express";
// import { extractLoginFromJWT } from "../../utils/jwt.js";
import Albums from "../../db/albums/albumsApi.js";
import S3Controller from "../../s3/s3api.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";

class DashboardController extends Controller {
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
    // this.router.get("/", authClients, catchAsync(this.getAvailableAlbums));
    this.router.get(
      ":photographer/:album",
      authClients,
      catchAsync(this.listDashboardImages)
    );
  };

  // public getAvailableAlbums: RequestHandler = async (req, res) => {
  //   const token = req.headers.authorization!.split(" ")[1];
  //   const login = extractLoginFromJWT(token);
  //   const content = await this.albums.availableAlbums(login);
  //   if (content) {
  //     const contentFiltered = content.map((item) => {
  //       return {
  //         album: item.albumName,
  //         photographer: item.login,
  //         location: item.albumLocation,
  //         datapicker: item.datapicker,
  //         price: +item.price! / 100 + "$",
  //       };
  //     });
  //     res.status(200).send({ content: contentFiltered });
  //   } else {
  //     res.status(200).send({ message: "You haven't access to any album" });
  //   }
  // };

  public listDashboardImages: RequestHandler = async (req, res) => {
    const albumName = req.params.album;
    const loginPhotographer = req.params.photographer;
    if (await this.albums.ifAlbumExists(loginPhotographer, albumName)) {
      const bucketName = process.env.BUCKET_NAME_S3;
      const folderName = `albums-watermarked/${loginPhotographer}-${albumName}/`;
      const params = {
        Bucket: bucketName,
        Prefix: folderName,
      };
      const contentResponse = await this.s3.listFolderObjects(params);
      res.status(200).send({
        message: "done!",
        content: contentResponse,
      });
    } else {
      res.status(404).send({
        message: "Album not found",
      });
    }
  };
}
export default DashboardController;
