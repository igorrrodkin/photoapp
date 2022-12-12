import { extractLoginFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import Clients from "../../db/clients/clientsApi.js";
import S3Controller from "../../s3/s3api.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";
import { reqPresignedUrl, setName } from "../../dtos/interfaces.js";

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
    this.router.post("/setname", authClients, catchAsync(this.setClientName));
    this.router.get("/profile", authClients, catchAsync(this.getClientData));
    this.router.post(
      "/uploadphoto",
      authClients,
      catchAsync(this.uploadSelfiesPhoto)
    );
  };

  public uploadSelfiesPhoto: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login: string = extractLoginFromJWT(token);
    const bucket = process.env.BUCKET_NAME_S3;
    if (login) {
      const body: reqPresignedUrl = req.body;
      const [signedUrl, combinedTags] = await this.s3.generateSefiesPresigned(
        bucket,
        login,
        body
      );
      res.status(200).json({
        // contentType: JSON.parse(Object.keys(req.body)[0]).contentType,
        contentType: req.body.contentType,
        method: "put",
        signedUrl,
        fields: {},
        headers: { "x-amz-tagging": combinedTags },
      });
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  };

  public setClientName: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const body: setName = req.body;
      const name = body.name;
      if (name) {
        await this.clients.updateClientName(login, name);
        res.status(200).send({
          message: "Name is added to the client",
        });
      } else {
        res.status(400).send({
          message: "Name was not provided",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  };

  public getClientData: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const name = await this.clients.getClientName(login);
      const bucketName = process.env.BUCKET_NAME_S3;
      const folderName = `selfies/${login}`;
      const params = {
        Bucket: bucketName,
        Prefix: folderName,
      };
      const contentResponse = await this.s3.listFolderObjects(params);

      res.status(200).send({
        message: "Client profile",
        name,
        photos: contentResponse,
      });
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  };
}

export default SelfiesController;
