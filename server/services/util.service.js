const { to } = require("await-to-js");
const pe = require("parse-error");
const { log } = require("./log.service");

class ResponseCode {}

ResponseCode.SUCCESS_OK = 200;
ResponseCode.SUCCESS_CREATED = 201;
ResponseCode.SUCCESS_ACCEPTED = 202;
ResponseCode.SUCCESS_NO_CONTENT = 204;

ResponseCode.BAD_REQUEST = 400;
ResponseCode.UNAUTHORIZED = 401;
ResponseCode.PAYMENT_REQUIRED = 402;
ResponseCode.FORBIDDEN = 403;
ResponseCode.NOT_FOUND = 404;
ResponseCode.METHOD_NOT_ALLOWED = 405;
ResponseCode.NOT_ACCEPTABLE = 406;
ResponseCode.REQUEST_TIMEOUT = 408;
ResponseCode.UNPROCESSABLE_ENTITY = 422;

ResponseCode.INTERNAL_SERVER_ERROR = 500;
ResponseCode.NOT_IMPLEMENTED = 501;
ResponseCode.BAD_GATEWAY = 502;
ResponseCode.SERVICE_UNAVAILABLE = 503;
ResponseCode.GATEWAY_TIMEOUT = 504;

module.exports.ResponseCode = ResponseCode;

class bbCode {}

bbCode.PHONE_NOT_VERIFIED = "EC3001";
bbCode.USER_EXISTS_WITH_EMAIL = "EC3002";

module.exports.bbCode = bbCode;

module.exports.to = async (promise) => {
  let err, res;

  if (!promise || typeof promise.then !== "function") {
    // This will catch if 'promise' is undefined or not a promise because it lacks 'then'
    err = new TypeError("Somethig went wrong!");
    return [err, undefined];
  }

  try {
    res = await promise;
  } catch (error) {
    err = error;
  }

  if (err) return [pe(err)];
  return [null, res];
};

/**
 * Response Error
 * @param res
 * @param err
 * @param code
 * @returns {*}
 * @constructor
 */
module.exports.ReE = function (
  res,
  err,
  code,
  extraCode = null,
  extradata = null
) {
  // Error Web Response
  if (
    err != null &&
    typeof err == "object" &&
    typeof err.message != "undefined"
  ) {
    err = err.message;
  }

  if (typeof code !== "undefined") res.statusCode = code;

  if (err == null) {
    err = "Something went wrong";
  }

  if (extraCode) {
    return res.json({ success: false, message: err, code: extraCode });
  }

  if (extradata) {
    return res.json(extradata);
  }
  return res.json({ success: false, message: err });
};

/**
 * Response Success
 * @param res
 * @param data
 * @param code
 * @returns {*}
 * @constructor
 */
module.exports.ReS = function (res, data, code) {
  // Success Web Response
  let send_data = { success: true };

  if (typeof data == "object") {
    send_data = Object.assign(data, send_data); //merge the objects
  }

  if (typeof code !== "undefined") res.statusCode = code;

  return res.json(send_data);
};

/**
 * Throw Error
 * @type {TE}
 */
// eslint-disable-next-line no-undef
module.exports.TE = TE = function (err_message, is_log) {
  // TE stands for Throw Error
  if (is_log === true) {
    log.error(err_message);
  }

  throw new Error(err_message);
};

module.exports.isValidEmail = function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@elections\.lk$/;
  return regex.test(email);
};
