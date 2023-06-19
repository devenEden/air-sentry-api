const constants = Object.freeze({
  socketEvents: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    READINGS: "readings",
    ERROR: "error",
    NEW_READING: "new_reading",
  },
  sensorGroupings: {
    AIR: "air",
    WATER: "water",
    SOIL: "soil",
    ATMOSPHERE: "atmosphere",
  },
  deviceStatus: {
    ACTIVE: "active",
    INACTIVE: "inactive",
  },
});

export default constants;
