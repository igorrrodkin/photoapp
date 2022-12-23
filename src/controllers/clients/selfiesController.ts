import {
  extractLoginFromJWT,
  extractClientUUIDFromJWT,
} from "../../utils/jwt.js";
import { RequestHandler } from "express";
import Clients from "../../db/clients/clientsApi.js";
import S3Controller from "../../s3/s3api.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";
import {
  changeNumberInterface,
  reqPresignedUrl,
  setEmail,
  setName,
} from "../../dtos/interfaces.js";
import { emailValidation } from "../../dtos/validation/emailValidator.js";
import { changeNumberOtp } from "../../utils/sendOtp.js";

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
    this.router.post("/setemail", authClients, catchAsync(this.setClientEmail));
    this.router.post(
      "/changenumber",
      authClients,
      catchAsync(this.changePhoneNumber)
    );
    this.router.post(
      "/changenumber/:phone/otp",
      authClients,
      catchAsync(this.changePhoneNumberSubmission)
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
  public setClientEmail: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuidClient: string = extractClientUUIDFromJWT(token);
    const body: setEmail = req.body;
    const email = body.email;
    const { error } = emailValidation(email);
    if (error) {
      res.status(400).send({
        message: error.details[0].message,
      });
    } else {
      await this.clients.updateClientEmail(uuidClient, email);
      res.status(200).send({
        message: "Email is added",
      });
    }
  };

  public setClientName: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuidClient = extractClientUUIDFromJWT(token);
    const body: setName = req.body;
    const name = body.name;
    if (name) {
      await this.clients.updateClientName(uuidClient, name);
      res.status(200).send({
        message: "Name is added to the client",
      });
    } else {
      res.status(400).send({
        message: "Name was not provided",
      });
    }
  };
  public changePhoneNumber: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuidClient = extractClientUUIDFromJWT(token);
    const content = await this.clients.getNumberByUUID(uuidClient);
    const body: changeNumberInterface = req.body;
    const newNumber = body.newNumber;
    if (newNumber) {
      const otp = changeNumberOtp(content.phoneNumber!, newNumber);
      await this.clients.updateOTPbyNumber(content.phoneNumber!, otp);

      // await this.clients.changePhoneNumber(phoneNumber, newNumber);
      res.status(200).send({
        message: "OTP is sent to Telegram(new phone number)",
      });
    } else {
      res.status(400).send({
        message: "Phone was not provided",
      });
    }
  };
  public changePhoneNumberSubmission: RequestHandler = async (req, res) => {
    const newNumber = req.params.phone;
    const token = req.headers.authorization!.split(" ")[1];
    const phoneNumber = extractClientUUIDFromJWT(token);
    const otpContent = await this.clients.getOTPdata(phoneNumber);
    const otp = req.body.otp;
    if (otp == otpContent.otp) {
      const now = new Date().getTime();
      const otpDepartureDate: number = +otpContent.date!;
      if (now - otpDepartureDate <= 180000) {
        await this.clients.changePhoneNumber(phoneNumber, newNumber);
        res.status(200).send({
          message: "Phone number has changed!",
        });
      } else {
        res.status(403).send({
          message: "OTP expired",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid OTP",
      });
    }
  };

  public getClientData: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const uuidClient = extractClientUUIDFromJWT(token);
    const content = await this.clients.getNumberByUUID(uuidClient);
    const phoneNumber = content.phoneNumber!;
    const data = await this.clients.getClientData(uuidClient);
    const bucketName = process.env.BUCKET_NAME_S3;
    const folderName = `selfies/${uuidClient}`;
    const params = {
      Bucket: bucketName,
      Prefix: folderName,
    };
    const contentResponse = await this.s3.listFolderObjects(params);

    res.status(200).send({
      message: "Client profile",
      phoneNumber: phoneNumber,
      email: data.email,
      name: data.name,
      photos: contentResponse,
    });
  };
}

export default SelfiesController;
