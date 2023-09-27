const { to, ReE, ResponseCode, bbCode } = require("../services/util.service");
const { User } = require("../models");
const CONFIG = require("../config/config");
const jwt = require("jsonwebtoken");

let authenticate = async function (req, res, next) {
  let bearerToken = req.headers.authorization;
  if (bearerToken !== undefined) {
    // eslint-disable-next-line no-undef
    let secret = Buffer.from(CONFIG.jwt_encryption, "base64");
    let token = bearerToken.split(" ")[1];
    let err,
      user = null;

    try {
      let decoded = jwt.verify(token, secret);
      [err, user] = await to(User.findById(decoded.user_id));
      if (err || !user) return ReE(res, "Invalid User", ResponseCode.UNAUTHORIZED, bbCode.INVALID_USER);
      if (user && !user.is_email_verified) {
        return ReE(res, bbCode.INVALID_USER, ResponseCode.UNAUTHORIZED);
      }
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      return ReE(res, "Invalid User", ResponseCode.UNAUTHORIZED, bbCode.INVALID_USER);
    }
  } else {
    req.user = null;
    return ReE(res, "Invalid User", ResponseCode.UNAUTHORIZED, bbCode.INVALID_USER);
  }
};
module.exports.authenticate = authenticate;