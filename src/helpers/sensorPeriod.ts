import { IReading } from "@utils/interfaces/app/app.interface";
import { TSensorTrend } from "@utils/types/app.types";
import { filter, map, sumBy, toString } from "lodash";
import moment, { Moment, unitOfTime } from "moment-timezone";

type TSensorPeriodOptions = {
  rangeNumbers: number[];
  periodType: unitOfTime.StartOf;
  periodSubType: unitOfTime.DurationConstructor;
  periodFormat: string;
};

export const sensorPeriodTrends = (
  period: string,
  currentDate: Moment,
  readings: IReading[],
  config: TSensorPeriodOptions
) => {
  const start = currentDate.clone().startOf(config.periodType);
  const end = currentDate.clone().endOf(config.periodType);

  const readingsByPeriod = filter(readings, (reading) => {
    const isoDate = new Date(toString(reading.createdAt)).toISOString();

    const readingDate = moment(toString(isoDate));

    return readingDate.isBetween(start, end);
  });

  const averageReadings =
    sumBy(readingsByPeriod, "sensorValue") / readingsByPeriod.length;

  const periodAverageValues = map(config.rangeNumbers, (day): TSensorTrend => {
    const currentDay = currentDate
        .clone()
        .startOf(config.periodType)
        .add(day, config.periodSubType)
        .format(config.periodFormat),
      dayReadings = filter(readingsByPeriod, (reading) => {
        const isoDate = new Date(toString(reading.createdAt)).toISOString();

        const readingDate = moment(toString(isoDate));

        return readingDate.isBetween(
          currentDate
            .clone()
            .startOf(config.periodType)
            .add(day, config.periodSubType),
          currentDate
            .clone()
            .startOf(config.periodType)
            .add(day + 1, config.periodSubType)
        );
      }),
      averageCalc = sumBy(dayReadings, "sensorValue") / dayReadings.length;

    return {
      average: isNaN(averageCalc) ? 0 : averageCalc.toFixed(2),
      name: currentDay,
      period: period,
    };
  });

  return {
    averageReadings: isNaN(averageReadings) ? 0 : averageReadings.toFixed(2),
    periodAverageValues,
  };
};

export const calculateSensorPeriodAverage = (
  periodType: unitOfTime.StartOf,
  readings: IReading[]
): number | string => {
  const currentDate = moment();
  const start = currentDate.clone().startOf(periodType);
  const end = currentDate.clone().endOf(periodType);

  const readingsByPeriod = filter(readings, (reading) => {
    const isoDate = new Date(toString(reading.createdAt)).toISOString();

    const readingDate = moment(toString(isoDate));

    return readingDate.isBetween(start, end);
  });

  const average =
    sumBy(readingsByPeriod, "sensorValue") / readingsByPeriod.length;

  return isNaN(average) ? 0 : average.toFixed(2);
};
