const { eventLogs } = require("./eventLogs");

const errorHandler = (err, req, res, next) => {
  // Check if headers have already been sent to the client
  if (res.headersSent) {
    return next(err);
  }

  const errMessage = `${err.name}:${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`;
  eventLogs(errMessage, "errorLogs.log");
  console.log(err.stack);

  const status = err.statusCode ? err.statusCode : 500; // server error
  res.status(status).json({ message: err.message });
};

module.exports = { errorHandler };
