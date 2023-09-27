const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
// const passport = require('passport');
const pe = require("parse-error");
const cors = require("cors");
const mongoose = require("mongoose");

const swaggerUi = require("swagger-ui-express");
const swaggerDocumentV1 = require("./public/documentation/v1/api-v1.json");
const { log } = require("./services/log.service");
const { ResponseCode } = require("./services/util.service");

const userServiceV1 = require("./routes/v1");

const app = express();

const CONFIG = require("./config/config");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Log Env
log.info("ENVIRONMENT:", CONFIG.app);
//DATABASE
require("./models");

// CORS
app.use(
  cors({
    origin: CONFIG.cors_origin,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: "*",
  })
);

app.use("/user-service/v1", userServiceV1);

if (CONFIG.app === "dev") {
  app.use("/user-service/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocumentV1));
  app.use("/user-service/logs", express.static("logs"));
}

app.use("/user-service/health", function (req, res) {
  const code = mongoose.connection.readyState;
  const connState = {
    code,
    message: codeMap[code],
  };
  const status = code === 1 ? ResponseCode.SUCCESS_OK : ResponseCode.SERVICE_UNAVAILABLE;

  return res.status(status).json(connState);
});

app.use("/", function (req, res) {
  res.statusCode = 200; //send the appropriate status code
  res.json({ status: "success", message: "Welcome to User Service API", data: {} });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message || "Something went wrong!",
    success: false,
  });
});

module.exports = app;

process.on("unhandledRejection", (error) => {
  log.error("Uncaught Error", pe(error));
});

let codeMap = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};
