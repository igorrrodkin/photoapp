import { RequestHandler } from "express";
import {
  ifClientLoginExists,
  userValidation,
  registerClient,
  updateOTPbyLogin,
  getOTPvalueByLogin,
  setResendOTPavailable,
  setResendOTPinavailable,
  checkIfresendOTPavailable,
} from "../../db/databaseApi.js";
import jsonwebtoken from "jsonwebtoken";
import Joi from "joi";
import "dotenv/config";
import { sendOneTimePassword } from "./telegramOTP.js";
import { credentialsClients } from "../../types.js";
import { catchAsync } from "../../middleware/catchAsync.js";

let otp: number;
const secret = process.env.JWT_SECRET_CLIENTS as string;

const signAccessToken = (login: string) =>
  jsonwebtoken.sign({ login }, secret, {
    expiresIn: "1 day",
  });

export const authHandler: RequestHandler = catchAsync(
  async (req, res, next) => {
    let user;
    const body: credentialsClients = req.body;
    if (body.type == "registration") {
      const schema: Joi.ObjectSchema = Joi.object({
        login: Joi.string().alphanum().min(8).max(20).required(),
        password: Joi.string().alphanum().min(8).max(20).required(),
      });
      const { value, error } = schema.validate({
        login: body.login,
        password: body.password,
      });
      if (error) {
        res.status(400).send({
          message: error.details[0].message,
        });
      } else {
        if (await ifClientLoginExists(body.login)) {
          res.status(400).send({
            message: "User with this login already exists!",
          });
        } else {
          await registerClient(body.login, body.password);
          res.status(200).send({
            message: "Successfully registered",
          });
        }
      }
    } else if (body.type == "login") {
      if (!req.body.otp) {
        user = await userValidation("clients", body.login, body.password);
        if (user.statusCode == 200) {
          otp = sendOneTimePassword(body.login);
          await updateOTPbyLogin(body.login, otp);
          await setResendOTPavailable(body.login);

          setTimeout(async () => {
            otp = 0;
            await updateOTPbyLogin(body.login, otp);
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
        if (req.body.otp == (await getOTPvalueByLogin(body.login))) {
          await setResendOTPavailable(body.login);
          res.status(200).send({
            message: "Successfully logged in",
            access_token: signAccessToken(body.login),
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
  }
);

export const resendOTP: RequestHandler = catchAsync(async (req, res, next) => {
  const body: credentialsClients = req.body;
  const user = await userValidation("clients", body.login, body.password);
  if (user.statusCode == 200) {
    if (await checkIfresendOTPavailable(body.login)) {
      otp = sendOneTimePassword(body.login);
      await updateOTPbyLogin(body.login, otp);
      await setResendOTPinavailable(body.login);
      setTimeout(async () => {
        otp = 0;
        await updateOTPbyLogin(body.login, otp);
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
});

export const extractLoginFromJWT = (token: string) => {
  const decoded: jsonwebtoken.JwtPayload = jsonwebtoken.decode(
    token
  ) as jsonwebtoken.JwtPayload;
  return decoded.login;
};

export const auth: RequestHandler = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const accessToken: string = req.headers.authorization.split(" ")[1];
      const decoded: jsonwebtoken.JwtPayload = jsonwebtoken.verify(
        accessToken,
        secret
      ) as jsonwebtoken.JwtPayload;
      next();
    } else {
      res.status(403).send({
        message: "Authorization header is not present",
      });
    }
  } catch (err) {
    res.status(403).send({
      message: "Forbidden",
    });
  }
};
