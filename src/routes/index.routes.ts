import AppController from "@controllers/app/AppController";
import express from "express";
import deviceRouter from "./device.routes";
import readingRouter from "./readings.routes";
import sensorRouter from "./sensor.routes";

const indexRouter = express.Router();

const prefix = "/api/v1";

indexRouter.get(`/`, AppController.index);
indexRouter.use(`${prefix}/devices`, deviceRouter);
indexRouter.use(`${prefix}/readings`, readingRouter);
indexRouter.use(`${prefix}/sensors`, sensorRouter);

export default indexRouter;
