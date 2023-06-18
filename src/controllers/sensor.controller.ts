import HttpStatusCodes from "@config/httpStatusCode";
import Sensor from "@models/sensors.model";
import { ISensor } from "@utils/interfaces/app/app.interface";
import HttpResponse from "@utils/http.util";
import { Request, Response, NextFunction } from "express";

const http = new HttpResponse();

class SensorController {
  /**
   * Get all sensors
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const sensors = await Sensor.find().populate("device");

      http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Sensors retrieved successfully",
        { sensors }
      );
    } catch (error) {
      return http.sendError(next, "Unable to get sensors", error);
    }
  }

  /**
   *  Get sensor details
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async createSensor(req: Request, res: Response, next: NextFunction) {
    try {
      const data: ISensor = req.body;
      const sensor = await Sensor.create(data);

      http.sendSuccess(
        res,
        HttpStatusCodes.CREATED,
        "Sensor created successfully",
        { sensor }
      );
    } catch (error) {
      return http.sendError(next, "Unable to create sensor", error);
    }
  }

  /**
   *  Get sensor details
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async updateSensor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: ISensor = req.body;
      const sensor = await Sensor.findByIdAndUpdate(id, data);

      http.sendSuccess(res, HttpStatusCodes.OK, "Sensor updated successfully", {
        sensor,
      });
    } catch (error) {
      return http.sendError(next, "Unable to update sensor", error);
    }
  }

  /**
   *  Get sensor details
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async getSensorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sensor = await Sensor.findById(id)
        .populate("device")
        .populate("readings");

      return http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Sensor details retrieved successfully",
        { sensor }
      );
    } catch (error) {
      return http.sendError(next, "Unable to get sensor details", error);
    }
  }

  /**
   * delete sensor
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async deleteSensor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sensor = await Sensor.findByIdAndDelete(id);

      return http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Sensor deleted successfully",
        { sensor }
      );
    } catch (error) {
      return http.sendError(next, "Unable to delete sensor", error);
    }
  }
}

export default SensorController;
