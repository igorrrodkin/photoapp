import { extractLoginFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import { authPhotographers } from "../../utils/authMiddleware.js";
import Albums from "../../db/albums/albumsApi.js";
import S3Controller from "../../s3/s3api.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { reqPresignedUrl } from "../../dtos/interfaces.js";

const bucketName = process.env.BUCKET_NAME_S3;

class ImagesController extends Controller {
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
    this.router.get("/:album", authPhotographers, catchAsync(this.listImages));
    this.router.post(
      "/:album/upload",
      authPhotographers,
      catchAsync(this.uploadImages)
    );
  };

  public uploadImages: RequestHandler = catchAsync(async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    const bucketName = process.env.BUCKET_NAME_S3;
    if (login) {
      const albumName = req.params.album;
      const body: reqPresignedUrl = req.body;
      const folderName = `albums/${login}-${albumName}/`;
      const folderNameWatermarked = `albums-watermarked/${login}-${albumName}/`;
      if (await this.albums.ifAlbumExists(login, albumName)) {
        const [signedUrl, combinedTags] = await this.s3.generatePresigned(
          bucketName,
          folderName,
          login,
          body
        );
        const signedUrlWatermarked = await this.s3.generatePresignedWatermarked(
          bucketName,
          folderNameWatermarked,
          login,
          body
        );

        res.status(200).json({
          // contentType: JSON.parse(Object.keys(req.body)[0]).contentType,
          contentType: req.body.contentType,
          method: "put",
          signedUrl,
          signedUrlWatermarked,
          fields: {},
          headers: { "x-amz-tagging": combinedTags },
        });
      } else {
        res.status(404).send({
          message: "Album not found",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  });

  public listImages: RequestHandler = catchAsync(async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    if (login) {
      const albumName = req.params.album;
      if (await this.albums.ifAlbumExists(login, albumName)) {
        const folderName = `albums-watermarked/${login}-${albumName}`;
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
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  });
}

export default ImagesController;
