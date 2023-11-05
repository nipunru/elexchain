const authService = require("../services/auth.service");
const {
  to,
  ReE,
  ReS,
  ResponseCode,
  bbCode,
  isValidEmail,
} = require("../services/util.service");
const { locales } = require("../locales/index");
const CONFIG = require("../config/config");
const { User } = require("../models/index");

/**
 * Sign Up new user
 * POST /signup
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const signUp = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  const body = req.body;

  if (!isValidEmail(body.email)) {
    return ReE(res, "Unauthorized email address.");
  }

  if (!body.unique_key && !body.email) {
    return ReE(res, locales.__("messages.error.empty_email_number"));
  } else if (!body.password) {
    return ReE(res, locales.__("messages.error.empty_password"));
  } else {
    let err, user;

    [err, user] = await to(authService.createUser(body));
    if (err) {
      return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
    }

    return ReS(
      res,
      {
        token: user.getJWT(),
        message: locales.__("messages.success.new_user_created"),
        user: await user.toResponse(),
      },
      ResponseCode.SUCCESS_CREATED
    );
  }
};
module.exports.signUp = signUp;

/**
 * Update User Profile
 * PUT /profile
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const profileUpdate = async function (req, res) {
  locales.setLocale(req.user.preferred_language);
  let err, user;
  user = req.user;
  let data = req.body;

  delete data["email"];
  delete data["phone"];
  delete data["password"];
  delete data["is_email_verified"];
  delete data["email_verification_code"];
  delete data["reset_password_code"];

  user.set(data);

  [err, user] = await to(user.save());
  if (err) {
    if (err.message.includes("E11000")) {
      if (err.message.includes("phone")) {
        err = locales.__("messages.error.number_already_in_use");
      } else if (err.message.includes("email")) {
        err = locales.__("messages.error.email_already_in_use");
      } else {
        err = locales.__("messages.error.duplicate_key_entry");
      }
    }
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  return ReS(
    res,
    { message: locales.__("messages.success.user_updated") },
    ResponseCode.SUCCESS_ACCEPTED
  );
};
module.exports.profileUpdate = profileUpdate;

/**
 * Get current user profile
 * GET /profile
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const profileGet = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  let user = req.user;
  user.withMatchingPreference = true;

  let userRes = await user.toResponse();

  return ReS(
    res,
    {
      message: locales.__("messages.success.user_details"),
      user: userRes,
    },
    ResponseCode.SUCCESS_OK
  );
};
module.exports.profileGet = profileGet;

/**
 * Authenticate user
 * POST /login
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const login = async function (req, res) {
  let err, user;

  if (!isValidEmail(req.body.email)) {
    return ReE(res, "Unauthorized email address.");
  }

  [err, user] = await to(authService.authUser(req.body));
  if (err) {
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  let token = user.getJWT();
  let level = user.email == "commissioner@elections.lk" ? 1 : 2;

  if (user && !user.is_email_verified) {
    return ReE(res, null, ResponseCode.SUCCESS_ACCEPTED, null, {
      token: token,
      user: await user.toResponse(),
      level: level,
      message: bbCode.PHONE_NOT_VERIFIED,
      success: false,
    });
  }

  return ReS(
    res,
    {
      token: token,
      user: await user.toResponse(),
      level: level,
      message: locales.__("messages.success.login"),
    },
    ResponseCode.SUCCESS_OK
  );
};
module.exports.login = login;

/**
 * Verify Phone Number by code
 * POST /verify-phone-number
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const verifyEmailNumber = async function (req, res) {
  let err, user;

  [err, user] = await to(authService.verifyEmailNumber(req.body));
  if (err) {
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  console.debug(user);

  return ReS(
    res,
    { message: locales.__("messages.success.phone_verified") },
    ResponseCode.SUCCESS_ACCEPTED
  );
};
module.exports.verifyEmailNumber = verifyEmailNumber;

/**
 * POST /resend-verification-code
 * Resend Verification code SMS
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const resendVerification = async function (req, res) {
  let err, user;

  [err, user] = await to(authService.resendVerification(req.body));
  if (err) {
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  console.debug(user);

  return ReS(
    res,
    { message: locales.__("messages.success.verification_code_sent") },
    ResponseCode.SUCCESS_OK
  );
};
module.exports.resendVerification = resendVerification;

/**
 * POST /get-reset-password-code
 * Resend Verification code SMS
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getResetPasswordCode = async function (req, res) {
  let err, user;

  [err, user] = await to(authService.getResetPasswordCode(req.body));
  if (err) {
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  console.debug(user);

  return ReS(
    res,
    { message: locales.__("messages.success.reset_code_sent") },
    ResponseCode.SUCCESS_OK
  );
};
module.exports.getResetPasswordCode = getResetPasswordCode;

/**
 * Update User Profile
 * PUT /profile/reset-password
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const resetPassword = async function (req, res) {
  let err, user;
  let data = req.body;

  [err, user] = await to(User.findOne({ phone: data.phone }));

  if (err) {
    return ReE(
      res,
      locales.__("messages.error.invalid_phone_number"),
      ResponseCode.SUCCESS_ACCEPTED
    );
  }

  if (!user.compareResetCode(data.reset_code)) {
    return ReE(
      res,
      locales.__("messages.error.invalid_reset_code"),
      ResponseCode.SUCCESS_ACCEPTED
    );
  }

  user.password = data.new_password;
  [err, user] = await to(user.save());
  if (err) {
    if (err.message.includes("E11000")) {
      if (err.message.includes("phone")) {
        err = locales.__("messages.error.number_already_in_use");
      } else if (err.message.includes("email")) {
        err = locales.__("messages.error.email_already_in_use");
      } else {
        err = locales.__("messages.error.duplicate_key_entry");
      }
      console.log("error.password_changed", err);
      return ReE(res, { message: err }, ResponseCode.SUCCESS_ACCEPTED);
    }
    console.log("error.password_changed", err);
    return ReE(
      res,
      { message: locales.__("messages.error.password_changed") },
      ResponseCode.SUCCESS_ACCEPTED
    );
  }
  return ReS(
    res,
    { message: locales.__("messages.success.password_changed") },
    ResponseCode.SUCCESS_ACCEPTED
  );
};
module.exports.resetPassword = resetPassword;

/**
 * Authenticate user
 * POST /login
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const logout = async function (req, res) {
  locales.setLocale(req.user.preferred_language);
  let err, user;
  user = req.user;
  let token = req.body["device_token"];

  let deviceTokens = user.device_tokens;

  for (let j = 0; j < deviceTokens.length; j++) {
    if (token === deviceTokens[j].token) {
      deviceTokens.splice(j, 1);
    }
  }

  user.device_tokens = deviceTokens;

  [err, user] = await to(user.save());
  if (err) {
    return ReE(res, err, ResponseCode.SUCCESS_ACCEPTED);
  }

  return ReS(
    res,
    {
      message: locales.__("messages.success.logout"),
    },
    ResponseCode.SUCCESS_OK
  );
};
module.exports.logout = logout;

/**
 * Retrieve Passport key
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const getJsonWebKey = async function (req, res) {
  try {
    let keys = {
      keys: [
        {
          k: CONFIG.jwt_encryption,
          alg: CONFIG.jwt_algorithm,
          kty: "oct",
          use: "sig",
          kid: CONFIG.jwt_key_id,
        },
      ],
    };
    let json = JSON.stringify(keys);
    let filename = "symmetric.json";
    let mimeType = "application/json";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-disposition", "attachment; filename=" + filename);
    res.send(json);
  } catch (error) {
    return ReS(
      res,
      {
        data: error,
        code: ResponseCode.INTERNAL_SERVER_ERROR,
        message: locales.__("message.error.internal.server.common.controller"),
        success: false,
      },
      ResponseCode.SUCCESS_OK
    );
  }
};
module.exports.getJsonWebKey = getJsonWebKey;
