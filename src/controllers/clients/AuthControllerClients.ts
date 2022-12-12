import { RequestHandler } from "express";
import Clients from "../../db/clients/clientsApi.js";
import "dotenv/config";
import { sendOneTimePassword } from "../../utils/sendOtp.js";
import { catchAsync } from "../../utils/catchAsync.js";
import Controller from "../Controller.js";
import { signAccessTokenClient } from "../../utils/jwt.js";
import { registrationClientsValidation } from "../../dtos/validation/registrationClients.js";
import { authClients } from "../../dtos/interfaces.js";
let otp: string;

class AuthControllerClients extends Controller {
  public readonly path: string;

  public constructor(path: string, public readonly clients: Clients) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.post("/auth", catchAsync(this.authHandler));
    this.router.post("/resend", catchAsync(this.resendOtpHandler));
  };

  public authHandler: RequestHandler = async (req, res) => {
    let user;
    const body: authClients = req.body;
    if (body.type == "registration") {
      const { error } = registrationClientsValidation(body);
      if (error) {
        res.status(400).send({
          message: error.details[0].message,
        });
      } else {
        if (await this.clients.ifClientLoginExists(body.login)) {
          res.status(400).send({
            message: "User with this login already exists!",
          });
        } else {
          await this.clients.registerClient(body.login, body.password);
          res.status(200).send({
            message: "Successfully registered",
          });
        }
      }
    } else if (body.type == "login") {
      if (!req.body.otp) {
        user = await this.clients.clientInterceptor(body.login, body.password);
        if (user.statusCode == 200) {
          otp = sendOneTimePassword(body.login);
          await this.clients.updateOTPbyLogin(body.login, otp);
          await this.clients.setResendOTPavailable(body.login);

          setTimeout(async () => {
            otp = "0";
            await this.clients.updateOTPbyLogin(body.login, otp);
          }, 1000 * 180);
          res.status(200).send({
            message: "OTP is sent to the Telegram chat",
          });
        } else {
          res.status(user.statusCode).send({
            message: user.message,
          });
        }
      } else {
        if (
          req.body.otp == (await this.clients.getOTPvalueByLogin(body.login))
        ) {
          await this.clients.setResendOTPavailable(body.login);
          res.status(200).send({
            message: "Successfully logged in",
            access_token: signAccessTokenClient(body.login),
          });
        } else {
          res.status(403).send({
            message: "Invalid OTP or it has already expired",
          });
        }
      }
    } else {
      res.status(400).send({
        message: "Bad Request",
      });
    }
  };

  public resendOtpHandler: RequestHandler = async (req, res) => {
    const body: authClients = req.body;
    const user = await this.clients.clientInterceptor(
      body.login,
      body.password
    );
    if (user.statusCode == 200) {
      if (await this.clients.checkIfresendOTPavailable(body.login)) {
        otp = sendOneTimePassword(body.login);
        await this.clients.updateOTPbyLogin(body.login, otp);
        await this.clients.setResendOTPinavailable(body.login);
        setTimeout(async () => {
          otp = "0";
          await this.clients.updateOTPbyLogin(body.login, otp);
        }, 1000 * 180);
        res.status(200).send({
          message: "OTP is resent to Telegram",
        });
      } else {
        res.status(403).send({
          message: " You can resend OTP just once",
        });
      }
    } else {
      res.status(user.statusCode).send({
        message: user.message,
      });
    }
  };
}

export default AuthControllerClients;
