import HttpStatusCodes from "@config/httpStatusCode";
import Reading from "@models/reading.model";
import Sensor from "@src/database/models/sensors.model";
import { IReading, ISensor } from "@src/utils/interfaces/app/app.interface";
import HttpResponse from "@utils/http.util";
import { Request, Response, NextFunction } from "express";
import { find, map, toNumber, toString } from "lodash";
import { Socket, Server as SocketServer } from "socket.io";
import constants from "@config/constants";

const { socketEvents } = constants;

const http = new HttpResponse();

class ReadingController {
  /**
   *  Get latest readings
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async getLatestReadings(req: Request, res: Response, next: NextFunction) {
    try {
      const { deviceCode } = req.params;

      const reading = await Reading.find({
        deviceCode,
      })
        .populate({
          path: "sensor",
          select: "sensorCode sensorName sensorUnits",
        })
        .populate({
          path: "device",
          select: "deviceCode deviceName",
        })
        .sort({ createdAt: -1 })
        .limit(20);

      const sensors = await Sensor.find({
        deviceCode,
      });

      const latestSensorReadings = map(
        sensors,
        (sensor): IReading | undefined => {
          const sensorReadings = find(
            reading,
            (r: IReading) => r.sensorCode === sensor.sensorCode
          );

          return sensorReadings;
        }
      );

      return http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Latest readings retrieved successfully",
        { latestSensorReadings }
      );
    } catch (error) {
      return http.sendError(next, "Unable to get latest readings", error);
    }
  }

  /**
   * Create reading
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async createReading(req: Request, res: Response, next: NextFunction) {
    try {
      const context = req.query;

      const { deviceCode } = context;

      const io: SocketServer = req.app.get("io");

      delete context.deviceCode;

      type Reading = {
        sensorCode: string;
        sensorValue: number | string;
        deviceCode: string;
      };
      const values: Reading[] = [];

      for (const key in context) {
        values.push({
          sensorCode: key,
          sensorValue: toNumber(context[key]),
          deviceCode: toString(deviceCode),
        });
      }

      io.emit(socketEvents.READINGS, values);

      const reading = await Reading.insertMany(values);

      return http.sendSuccess(
        res,
        HttpStatusCodes.CREATED,
        "Reading created successfully",
        { reading }
      );
    } catch (error) {
      return http.sendError(next, "Unable to create reading", error);
    }
  }

  /**
   *  Update reading
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async updateReading(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const reading = await Reading.findByIdAndUpdate(id, data, {
        new: true,
      });

      return http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Reading updated successfully",
        { reading }
      );
    } catch (error) {
      return http.sendError(next, "Unable to update reading", error);
    }
  }

  /**
   * delete reading
   * @param req
   * @param res
   * @param next
   * @returns
   */
  async deleteReading(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await Reading.findByIdAndDelete(id);

      return http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Reading deleted successfully",
        {}
      );
    } catch (error) {
      return http.sendError(next, "Unable to delete reading", error);
    }
  }

  /**
   * Get readings by device code
   * @param req
   * @param res
   * @param next
   * */
  static async socketReadings(socket: Socket, deviceCode: string) {
    try {
      const reading = await Reading.find<IReading>({
        deviceCode,
      })
        .populate({
          path: "sensor",
          select: "sensorName sensorUnit",
        })
        .populate({
          path: "device",
          select: "deviceName",
        })
        .sort({ createdAt: -1 })
        .limit(20);

      const sensors = await Sensor.find<ISensor>({
        deviceCode,
      });

      const latestSensorReadings = map(
        sensors,
        (sensor): IReading | undefined => {
          const sensorReadings = find(
            reading,
            (r: IReading) => r.sensorCode === sensor.sensorCode
          );

          return sensorReadings;
        }
      );

      socket.emit(socketEvents.READINGS, latestSensorReadings);
    } catch (error) {
      socket.emit("error", error);
    }
  }
}

export default ReadingController;
