import "dotenv/config";
import { PgDatabase } from "drizzle-orm-pg";
import App from "./App.js";
import AuthControllerClients from "./controllers/clients/AuthControllerClients.js";
import DashboardController from "./controllers/clients/DashboardController.js";
import PaymentController from "./controllers/clients/PaymentController.js";
import SelfiesController from "./controllers/clients/SelfiesController.js";
import AlbumsController from "./controllers/photographers/AlbumsController.js";
import AuthController from "./controllers/photographers/AuthController.js";
import ImagesController from "./controllers/photographers/ImagesController.js";
import Clients from "./db/clients/clientsApi.js";
import { db } from "./db/connection.js";
import Photographers from "./db/photographers/photographersApi.js";
import Albums from "./db/albums/albumsApi.js";

const main = async () => {
  const client: PgDatabase = await db.connect();

  const controllers = [
    new AuthControllerClients("/clients", new Clients(client)),
    new DashboardController("/clients/dashboard", new Albums(client)),
    new SelfiesController("/clients/selfies", new Clients(client)),
    new PaymentController("/clients/payment", new Albums(client)),
    new AuthController("/photographers", new Photographers(client)),
    new AlbumsController("/photographers/albums", new Albums(client)),
    new ImagesController("/photographers/images", new Albums(client)),
  ];
  const port = process.env.PORT_APP || 3000;

  const app = new App(controllers, port);

  app.listen();
};

main();
