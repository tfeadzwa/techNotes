const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");

const eventLogs = async (message, logFileName) => {
  const dateTime = format(new Date(), "dd/MM/yyyy\thh:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(`Error Message: ${err.message}`);
  }
};

const logger = (req, res, next) => {
  const message = `${req.url}\t${req.headers.origin}\t${req.method}`;
  eventLogs(message, "reqLogs.log");
  next();
};

module.exports = { eventLogs, logger };
