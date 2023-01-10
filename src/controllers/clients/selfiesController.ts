import { extractClientUUIDFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import Clients from "../../db/clients/Clients.js";
import S3Controller from "../../s3/S3Controller.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";

const bucket_selfies = process.env.BUCKET_SELFIES;
const bucket_selfies_miniatures = process.env.BUCKET_SELFIES_MINIATURE;

class SelfiesController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly clients: Clients,
    public readonly s3: S3Controller
  ) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.post(
      "/upload",
      authClients,
      catchAsync(this.uploadSelfiesPhoto)
    );
  };

  public uploadSelfiesPhoto: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuid: string = extractClientUUIDFromJWT(token);
    const signedUrl = await this.s3.generateSefiesPresigned(
      bucket_selfies,
      uuid,
      req.body.contentType
    );
    const signedUrlMini = await this.s3.generateSefiesPresigned(
      bucket_selfies_miniatures,
      uuid,
      req.body.contentType
    );
    res.status(200).json({
      message:
        "Presigned URLs for loading photo in the valid format + rounded miniature",
      signedUrl,
      signedUrlMini,
    });
  };
}

export default SelfiesController;
