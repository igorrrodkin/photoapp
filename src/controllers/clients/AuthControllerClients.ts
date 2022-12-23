import { RequestHandler } from "express";
import Clients from "../../db/clients/clientsApi.js";
import "dotenv/config";
import { sendOneTimePassword } from "../../utils/sendOtp.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { signAccessTokenClient } from "../../utils/jwt.js";
// import { registrationClientsValidation } from "../../dtos/validation/registrationClients.js";
// import { authClients } from "../../dtos/interfaces.js";

class AuthControllerClients extends Controller {
  public readonly path: string;

  public constructor(path: string, public readonly clients: Clients) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.post("/auth", catchAsync(this.authHandler));
    this.router.post("/:phone/otp", catchAsync(this.otpHandler));
    this.router.post("/:phone/resend", catchAsync(this.resendHandler));
  };
  public authHandler: RequestHandler = async (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    if (!phoneNumber) {
      res.status(404).send({
        message: "Phone number was not provided",
      });
    } else {
      const otp = sendOneTimePassword(phoneNumber);
      if (await this.clients.ifClientNumberNotExists(phoneNumber)) {
        await this.clients.registerClient(phoneNumber);
      }
      await this.clients.updateOTPbyNumber(phoneNumber, otp);
      res.status(200).send({
        message: " OTP is sent to Telegram",
      });
    }
  };

  public otpHandler: RequestHandler = async (req, res) => {
    const otp = req.body.otp;
    const phoneNumber = req.params.phone;
    const otpContent = await this.clients.getOTPdata(phoneNumber);
    if (otp == otpContent.otp) {
      const now = new Date().getTime();
      const otpDepartureDate: number = +otpContent.date!;
      if (now - otpDepartureDate <= 180000) {
        const content = await this.clients.getUUIDbyNumber(phoneNumber);
        res.status(200).send({
          message: "Successfully logged in",
          access_token: signAccessTokenClient(content.uuid!),
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

  public resendHandler: RequestHandler = async (req, res) => {
    const phoneNumber = req.params.phone;
    const otp = sendOneTimePassword(phoneNumber);
    await this.clients.updateOTPbyNumber(phoneNumber, otp);
    res.status(200).send({
      message: "OTP is sent",
    });
  };
}

export default AuthControllerClients;
