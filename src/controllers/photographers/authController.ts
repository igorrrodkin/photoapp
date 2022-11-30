import { RequestHandler } from "express";
import { userValidation } from "../../db/databaseApi.js";
import jsonwebtoken from "jsonwebtoken";
import "dotenv/config";
import { credentialsPhotographers } from "../../types.js";

const secret = process.env.JWT_SECRET as string;

const signAccessToken = (login: string): string =>
  jsonwebtoken.sign({ login }, secret, {
    expiresIn: "1 day",
  });

export const login: RequestHandler = async (req, res, next) => {
  const body: credentialsPhotographers = req.body;
  const user = await userValidation("photographers", body.login, body.password);
  if (user.statusCode == 200) {
    res.status(user.statusCode).send({
      message: user.message,
      access_token: signAccessToken(body.login),
    });
  } else {
    res.status(user.statusCode).send({
      message: user.message,
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
      const accessToken = req.headers.authorization.split(" ")[1];
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
