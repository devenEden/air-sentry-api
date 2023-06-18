const constants = Object.freeze({
  socketEvents: {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    READINGS: "readings",
    ERROR: "error",
  },
  deviceStatus: {
    ACTIVE: "active",
    INACTIVE: "inactive",
  },
});

export default constants;
