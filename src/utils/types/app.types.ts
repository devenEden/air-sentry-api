export type serverResponse = {
  server: {
    status: boolean;
    message?: string | null;
  };
};

export type validationErrorItem = {
  field: string | undefined;
  message: string;
};

export type latestReading = {
  sensorValue: string | number;
  deviceName: string | undefined;
  sensorName: string;
  sensorUnits: string;
  sensorCode: string;
  sensorGrouping: string;
};
