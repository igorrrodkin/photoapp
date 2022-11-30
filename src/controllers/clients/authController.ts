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

let otp: number;
const secret = process.env.JWT_SECRET_CLIENTS as string;

const signAccessToken = (login: string) =>
  jsonwebtoken.sign({ login }, secret, {
    expiresIn: "1 day",
  });

export const authHandler: RequestHandler = async (req, res, next) => {
  try {
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
        user = await userValidation("clients", body.login, body.password);
        if (req.body.otp == (await getOTPvalueByLogin(body.login))) {
          await setResendOTPavailable(body.login);
          res.status(user.statusCode).send({
            message: user.message,
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
  } catch (err) {
    res.status(400).send({
      message: "Something went wrong",
    });
  }
};

export const resendOTP: RequestHandler = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(400).send({
      message: "Something went wrong",
    });
  }
};

export const refresh: RequestHandler = (req, res, next) => {
  try {
    let refreshToken: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      refreshToken = req.headers.authorization.split(" ")[1];
      const decoded: jsonwebtoken.JwtPayload = jsonwebtoken.verify(
        refreshToken,
        secret
      ) as jsonwebtoken.JwtPayload;
      const newAccessToken: string = signAccessToken(decoded.login);
      res.status(201).json({
        status: "success",
        new_access: newAccessToken,
      });
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
