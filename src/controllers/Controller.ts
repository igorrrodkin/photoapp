import { Router, RequestHandler } from "express";

abstract class Controller {
  public readonly router: Router;
  public readonly path: string;

  public constructor(path: string) {
    this.router = Router();
    this.path = path;
  }

  protected protectRoute: RequestHandler = () => {};
}

export default Controller;
