import "dotenv/config";
import { PgDatabase } from "drizzle-orm-pg";
import App from "./App.js";
import AuthControllerClients from "./controllers/clients/AuthControllerClients.js";
import DashboardController from "./controllers/clients/DashboardController.js";
// import PaymentController from "./controllers/clients/PaymentController.js";
import SelfiesController from "./controllers/clients/SelfiesController.js";
import AlbumsController from "./controllers/photographers/AlbumsController.js";
import AuthController from "./controllers/photographers/AuthController.js";
import ImagesController from "./controllers/photographers/ImagesController.js";
import Clients from "./db/clients/Clients.js";
import { db } from "./db/connection.js";
import Photographers from "./db/photographers/Photographers.js";
import Albums from "./db/albums/Albums.js";
import { S3 } from "aws-sdk";
import { connectS3 } from "./s3/s3connection.js";
import S3Controller from "./s3/S3Controller.js";
import Selfies from "./db/selfies/Selfies.js";
import SettingsController from "./controllers/clients/SettingsController.js";
import Photos from "./db/photos/Photos.js";
const main = async () => {
  const client: PgDatabase = await db.connect();
  const s3client: S3 = connectS3();
  const controllers = [
    new AuthControllerClients("/clients/auth", new Clients(client)),
    new DashboardController(
      "/clients/dashboard",
      new Albums(client),
      new Clients(client),
      new Photos(client),
      new S3Controller(s3client)
    ),
    new SelfiesController(
      "/clients/selfies",
      new Clients(client),
      new S3Controller(s3client)
    ),
    new SettingsController(
      "/clients/settings",
      new Clients(client),
      new Selfies(client)
    ),
    // new PaymentController(
    //   "/clients/payment",
    //   new Albums(client),
    //   new S3Controller(s3client)
    // ),
    new AuthController("/photographers", new Photographers(client)),
    new AlbumsController(
      "/photographers/albums",
      new Albums(client),
      new S3Controller(s3client)
    ),
    new ImagesController(
      "/photographers/images",
      new Albums(client),
      new Clients(client),
      new Photos(client),
      new S3Controller(s3client)
    ),
  ];
  const port = process.env.PORT_APP || 3000;

  const app = new App(controllers, port);

  app.listen();
};

main();
