import { RequestHandler } from "express";
import Albums from "../../db/albums/albumsApi.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { createProduct } from "../../utils/payment.js";
import { extractLoginFromJWT } from "../../utils/jwt.js";
import { albumCreation, giveAccess } from "../../dtos/interfaces.js";
import { authClients, authPhotographers } from "../../utils/authMiddleware.js";
import Controller from "../Controller.js";

class AlbumsController extends Controller {
  public readonly path: string;

  public constructor(path: string, public readonly albums: Albums) {
    super("");
    this.path = path;
    this.initializeRoutes();
  }

  public initializeRoutes = () => {
    this.router.get("/", authPhotographers, catchAsync(this.showAlbums));
    this.router.post(
      "/create",
      authPhotographers,
      catchAsync(this.createAlbum)
    );
    this.router.post(
      "/:album/giveaccess",
      authClients,
      catchAsync(this.giveAccessToClients)
    );
  };

  public createAlbum: RequestHandler = async (req, res) => {
    const content: albumCreation = req.body;
    // date format dd-mm-yyyy
    const dateRegEx = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g;
    if (!content.albumName || !content.location) {
      res.status(400).send({
        message: "Album name and location are required!",
      });
    } else if (!content.datapicker.match(dateRegEx)) {
      res.status(400).send({
        message: "Incorrect date format, it should be DD/MM/YYYY",
      });
    } else {
      const token: string = req.headers.authorization!.split(" ")[1];
      const login: string | undefined = extractLoginFromJWT(token);
      if (login) {
        const albumExists = await this.albums.ifAlbumExists(
          login,
          content.albumName
        );
        if (albumExists) {
          res.status(400).send({
            message: "Album with this name already exists!",
          });
        } else {
          const [productData, priceData] = await createProduct(
            login,
            content.albumName,
            content.price
          );
          await this.albums.createAlbumDB(
            login,
            content.albumName,
            content.location,
            content.datapicker,
            JSON.stringify(content.price),
            priceData.id,
            productData.id
          );
          res.status(200).send({
            message: "Successfully created!",
          });
        }
      } else {
        res.status(403).send({
          message: "Invalid login",
        });
      }
    }
  };

  public showAlbums: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const content = await this.albums.listAlbums(login);
      if (content.length) {
        const mappedContent = content.map((item) => {
          return {
            album: item.album_name,
            location: item.album_location,
            datapicker: item.datapicker,
            price: +item.price! / 100 + "$",
          };
        });
        res.status(200).send({
          content: mappedContent,
        });
      } else {
        res.status(200).send({
          message: "You haven't any albums",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  };

  public giveAccessToClients: RequestHandler = async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];
    const login = extractLoginFromJWT(token);
    if (login) {
      const album = req.params.album;
      const body: giveAccess = req.body;
      const clientLogins = body.giveAccessTo;

      if (!(await this.albums.ifAlbumExists(login, album))) {
        res.status(404).send({
          message: "Album not found",
        });
      } else {
        await this.albums.giveAccessToAlbum(login, album, clientLogins);
        res.status(200).send({
          message: "Access is given",
        });
      }
    } else {
      res.status(403).send({
        message: "Invalid login",
      });
    }
  };
}

export default AlbumsController;
