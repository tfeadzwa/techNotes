const { eventLogs } = require("./eventLogs");

const errorHandler = (req, res, err, next) => {
  const errMessage = `${err.name}:${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`;
  eventLogs(errMessage, "errorLogs.log");
  console.log(err.stack);

  const status = req.statusCode ? req.statusCode : 500; // server error
  res.status(status).json({ message: err.message });
  next();
};

module.exports = { errorHandler };
