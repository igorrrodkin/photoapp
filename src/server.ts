import express, { Errback, NextFunction, Request, Response } from "express";
import photographRouter from "./routes/photographRoutes.js";
import "dotenv/config";
import clientRouter from "./routes/clientRoutes.js";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

const port = (process.env.PORT_APP as unknown as number) || 3000;
const hostname = "127.0.0.1";

const app = express();

app.use(express.json());

app.use(
  "/*",
  (err: Errback, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send({
      message: "Something went wrong!",
    });
  }
);
app.use("/photographers/", photographRouter);
app.use("/clients/", clientRouter);
app.listen(port, hostname, () => {
  bot.launch();
  console.log(`App is running on port ${process.env.PORT_APP}`);
});
