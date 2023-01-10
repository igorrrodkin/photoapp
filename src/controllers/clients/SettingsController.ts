import { extractClientUUIDFromJWT } from "../../utils/jwt.js";
import { RequestHandler } from "express";
import Clients from "../../db/clients/Clients.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { authClients } from "../../utils/authMiddleware.js";
import {
  changeNumberInterface,
  setEmail,
  setName,
} from "../../dtos/interfaces.js";
import { emailValidation } from "../../dtos/validation/emailValidator.js";
import { changeNumberOtp } from "../../utils/sendOtp.js";
import Selfies from "../../db/selfies/Selfies.js";

class SettingsController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly clients: Clients,
    public readonly selfies: Selfies
  ) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.get("/", authClients, this.getClientData);
    this.router.post("/setname", authClients, catchAsync(this.setClientName));
    this.router.post("/setemail", authClients, catchAsync(this.setClientEmail));
    this.router.post(
      "/changenumber",
      authClients,
      catchAsync(this.changePhoneNumber)
    );
    this.router.post(
      "/changenumber/:phone",
      authClients,
      catchAsync(this.changePhoneNumberSubmission)
    );
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
    const body: changeNumberInterface = req.body;
    const newNumber = body.newNumber;
    if (newNumber) {
      const otp = changeNumberOtp(newNumber);
      await this.clients.updateOTPbyUUID(uuidClient, otp);
      res.status(200).send({
        message: "OTP is sent to Telegram(new phone number)",
      });
    } else {
      res.status(400).send({
        message: "Phone number was not provided",
      });
    }
  };
  public changePhoneNumberSubmission: RequestHandler = async (req, res) => {
    const newNumber = req.params.phone;
    const token = req.headers.authorization!.split(" ")[1];
    const uuidClient = extractClientUUIDFromJWT(token);
    const otpDatabase = await this.clients.getOTPdataByUUID(uuidClient);
    const otp = req.body.otp;
    if (otp == otpDatabase.otp) {
      const now = new Date().getTime();
      const otpDepartureDate: number = +otpDatabase.date!;
      if (now - otpDepartureDate <= 180000) {
        await this.clients.changePhoneNumber(uuidClient, newNumber);
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
    const data = await this.clients.getClientData(uuidClient);
    const frontPhoto = await this.selfies.getFrontPhotoPresignedMini(
      uuidClient
    );
    res.status(200).send({
      message: "Client profile",
      email: data.email,
      name: data.name,
      presignedFront: frontPhoto,
    });
  };
}

export default SettingsController;
