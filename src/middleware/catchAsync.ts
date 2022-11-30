import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      res.status(500).send({ message: "Something went wrong" });
    }
  };
};
