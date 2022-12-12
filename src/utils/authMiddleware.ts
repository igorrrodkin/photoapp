import jsonwebtoken from 'jsonwebtoken';
import { RequestHandler } from 'express';

const clientSecret = process.env.JWT_SECRET_CLIENTS;
const photographerSecret = process.env.JWT_SECRET;

export const authClients: RequestHandler = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const accessToken: string = req.headers.authorization.split(' ')[1];
      jsonwebtoken.verify(accessToken, clientSecret) as jsonwebtoken.JwtPayload;
      next();
    } else {
      res.status(403).send({
        message: 'Authorization header is not present',
      });
    }
  } catch (err) {
    res.status(403).send({
      message: 'Forbidden',
    });
  }
};

export const authPhotographers: RequestHandler = (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const accessToken: string = req.headers.authorization.split(' ')[1];
      jsonwebtoken.verify(
        accessToken,
        photographerSecret
      ) as jsonwebtoken.JwtPayload;
      next();
    } else {
      res.status(403).send({
        message: 'Authorization header is not present',
      });
    }
  } catch (err) {
    res.status(403).send({
      message: 'Forbidden',
    });
  }
};
