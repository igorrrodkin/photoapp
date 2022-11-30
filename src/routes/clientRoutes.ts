import { Router } from "express";
import {
  getAvailableAlbums,
  listDashboardImages,
} from "../controllers/clients/dashboardController.js";
import {
  authHandler,
  resendOTP,
  auth,
} from "../controllers/clients/authController.js";
import {
  buyAlbum,
  cancelPayment,
  downloadImages,
  loadImage,
} from "../controllers/clients/paymentController.js";
import {
  clientName,
  getClientData,
  uploadSelfiesPhoto,
} from "../controllers/clients/selfiesController.js";

const clientRouter = Router();

clientRouter.post("/auth", authHandler);
clientRouter.post("/resend", resendOTP);
clientRouter.get("/dashboard", auth, getAvailableAlbums);
clientRouter.post("/settings/name", auth, clientName);
clientRouter.get("/settings/profile", auth, getClientData);
clientRouter.post("/selfies", auth, uploadSelfiesPhoto);
clientRouter.get("/dashboard/:photographer/:album", auth, listDashboardImages);
clientRouter.get("/dashboard/:photographer/:album/buy", auth, buyAlbum);
clientRouter.get(
  "/dashboard/:photographer/:album/payment/success",
  auth,
  downloadImages
);
clientRouter.get(
  "/dashboard/:photographer/:album/:photo/download",
  auth,
  loadImage
);
clientRouter.get(
  "/dashboard/:photographer/:album/payment/cancel",
  auth,
  cancelPayment
);

clientRouter.all("/*", (req, res, next) => {
  res.status(404).send("Endpoint is not supported");
});
export default clientRouter;
