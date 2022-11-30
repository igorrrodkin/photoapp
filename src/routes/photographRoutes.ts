import { Router } from "express";
import { login, auth } from "../controllers/photographers/authController.js";
import {
  createAlbum,
  giveAccessToClients,
  showAlbums,
} from "../controllers/photographers/albumsController.js";
import {
  uploadImages,
  listImages,
} from "../controllers/photographers/imagesController.js";

const photographRouter = Router();

photographRouter.post("/login", login);

photographRouter.get("/albums", auth, showAlbums);
photographRouter.post("/albums/create", auth, createAlbum);
photographRouter.get("/albums/:album", auth, listImages);
photographRouter.post("/albums/:album/upload", auth, uploadImages);
photographRouter.post("/albums/:album/giveaccess", auth, giveAccessToClients);
photographRouter.all("/*", (req, res, next) => {
  res.status(404).send("Endpoint is not supported");
});

export default photographRouter;
