const allowedOrings = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callBack) => {
    if (allowedOrings.indexOf(origin) !== -1 || !origin) {
      callBack(null, true);
    } else {
      callBack(new Error("Not allowed by cors!"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
