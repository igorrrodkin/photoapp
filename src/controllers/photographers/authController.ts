import { RequestHandler } from "express";
import Photographers from "../../db/photographers/photographersApi.js";
import { loginPhotographers } from "../../dtos/interfaces.js";
import { signAccessTokenPhotographer } from "../../utils/jwt.js";
import Controller from "../Controller.js";

class AuthController extends Controller {
  public readonly path: string;

  public constructor(
    path: string,
    public readonly photographers: Photographers
  ) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.post("/login", this.login);
  };
  public login: RequestHandler = async (req, res) => {
    const body: loginPhotographers = req.body;
    const user = await this.photographers.photographerInterceptor(
      body.login,
      body.password
    );
    if (user.statusCode == 200) {
      res.status(user.statusCode).send({
        message: user.message,
        access_token: signAccessTokenPhotographer(body.login),
      });
    } else {
      res.status(user.statusCode).send({
        message: user.message,
      });
    }
  };
}

export default AuthController;
