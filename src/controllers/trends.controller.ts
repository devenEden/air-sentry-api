import HttpStatusCodes from "@config/httpStatusCode";
import constants from "@config/constants";
import Reading from "@models/reading.model";
import Sensor from "@models/sensors.model";
import { IReading, ISensor } from "@utils/interfaces/app/app.interface";
import HttpResponse from "@utils/http.util";
import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";
import envVars from "@config/envVars";
import AppError from "@utils/appError.util";
import { range } from "lodash";
import { sensorPeriodTrends } from "@src/helpers/sensorPeriod";
import { TSensorTrend } from "@utils/types/app.types";

const http = new HttpResponse();

class TrendsController {
  /**
   * get sensor reading trends
   * @param req
   * @param res
   * @param next
   */
  async getSensorReadingTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sensorId } = req.params;
      const { period } = req.query;

      const sensor = await Sensor.findById<ISensor>(sensorId);

      if (!sensor) throw new Error("Sensor not found");

      moment.tz.setDefault(envVars.timezone);

      const currentDate = moment();

      const readings: IReading[] = await Reading.find<IReading>({
        sensorCode: sensor?.sensorCode,
      })
        .sort({ createdAt: -1 })
        .limit(500);

      let sensorTrends: TSensorTrend[] = [];
      let periodAverage: string | number = 0;
      const { trendPeriods } = constants;

      switch (period) {
        case trendPeriods.DAY: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.DAY,
            currentDate,
            readings,
            {
              periodFormat: "HH:mm",
              periodSubType: "h",
              periodType: "d",
              rangeNumbers: range(0, 23),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }

        case trendPeriods.WEEK: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.WEEK,
            currentDate,
            readings,
            {
              periodFormat: "ddd",
              periodSubType: "d",
              periodType: "w",
              rangeNumbers: range(0, 7),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }

        case trendPeriods.MONTH: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.MONTH,
            currentDate,
            readings,
            {
              periodFormat: "ddd do MMM YY",
              periodSubType: "d",
              periodType: "M",
              rangeNumbers: range(0, 30),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }
        default:
          throw new AppError("Invalid period", HttpStatusCodes.BAD_REQUEST);
      }

      http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Reading trends retrieved successfully",
        {
          sensor,
          periodAverage,
          sensorTrends,
        }
      );
    } catch (error) {
      http.sendError(next, "Unable to get reading trends", error);
    }
  }

  /**
   * get air quality trends
   * @param req
   * @param res
   * @param next
   */
  async airQualityTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.query;

      moment.tz.setDefault(envVars.timezone);

      const currentDate = moment();

      const airSensors = await Sensor.find<ISensor>({
        sensorGrouping: constants.sensorGroupings.AIR,
      });

      const readings = await Reading.find<IReading>({
        sensorCode: { $in: airSensors.map((s) => s.sensorCode) },
      })
        .sort({ createdAt: -1 })
        .limit(500);

      let sensorTrends: TSensorTrend[] = [];
      let periodAverage: string | number = 0;
      const { trendPeriods } = constants;

      switch (period) {
        case trendPeriods.DAY: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.DAY,
            currentDate,
            readings,
            {
              periodFormat: "HH:mm",
              periodSubType: "h",
              periodType: "d",
              rangeNumbers: range(0, 23),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }

        case trendPeriods.WEEK: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.WEEK,
            currentDate,
            readings,
            {
              periodFormat: "ddd",
              periodSubType: "d",
              periodType: "w",
              rangeNumbers: range(0, 7),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }

        case trendPeriods.MONTH: {
          const sensorPeriod = sensorPeriodTrends(
            trendPeriods.MONTH,
            currentDate,
            readings,
            {
              periodFormat: "ddd do MMM YY",
              periodSubType: "d",
              periodType: "M",
              rangeNumbers: range(0, 30),
            }
          );

          sensorTrends = sensorPeriod.periodAverageValues;
          periodAverage = sensorPeriod.averageReadings;

          break;
        }
        default:
          throw new AppError("Invalid period", HttpStatusCodes.BAD_REQUEST);
      }

      http.sendSuccess(
        res,
        HttpStatusCodes.OK,
        "Reading trends retrieved successfully",
        {
          units: "ppm",
          periodAverage,
          sensorTrends,
        }
      );
    } catch (error) {
      http.sendError(next, "Unable to get air quality trends", error);
    }
  }
}

export default TrendsController;
