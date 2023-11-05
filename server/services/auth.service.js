const { User } = require("../models/index");
const { UserHelper } = require("../helpers/user.helper");
const { to, TE, bbCode } = require("./util.service");
const userHelper = require("../helpers/user.helper");
const { log } = require("./log.service");
const CONFIG = require("../config/config");
const { locales } = require("../locales/index");

/**
 * Register new user
 * @param userInfo
 * @returns {Promise<void>}
 */
const createUser = async function (userInfo) {
  let unique_key, auth_info, err, user, success;

  auth_info = {};
  auth_info.status = UserHelper.AUTH_STATUS_CREATE;

  unique_key = getUniqueKeyFromBody(userInfo);
  if (!unique_key) {
    TE("A phone number was not entered.");
  }

  // if (validator.isMobilePhone(unique_key, 'any')) {
  userInfo.email = unique_key;
  userInfo.email_verification_code = userHelper.generateVerificationCode();

  [err, user] = await to(User.create(userInfo));
  if (err) {
    if (err.message.includes("E11000")) {
      if (err.message.includes("email")) {
        TE(locales.__("messages.error.number_already_in_use"));
      } else if (err.message.includes("email")) {
        TE(locales.__("messages.error.email_already_in_use"));
      } else {
        TE(locales.__("messages.error.duplicate_key_entry"));
      }
    }
  }

  [err, success] = await to(sendEmailVerificationCode(user));
  if (err) TE("Error in sending Email");

  console.debug(success);

  return user;
};
module.exports.createUser = createUser;

/**
 * Login User
 * @param userInfo
 * @returns {Promise<*>}
 */
const authUser = async function (userInfo) {
  let unique_key, err;
  let auth_info = {};
  unique_key = getUniqueKeyFromBody(userInfo);

  if (!unique_key) {
    TE("Please enter a phone number to login");
  }

  if (!userInfo.password) {
    TE("Please enter a password to login");
  }

  let user;

  [err, user] = await to(User.findOne({ email: unique_key }));
  if (err) {
    TE(err.message);
  }

  if (!user) {
    TE("Incorrect Credentials");
  }

  [err, user] = await to(user.comparePassword(userInfo.password));

  if (err) {
    TE(err.message);
  }

  return user;
};
module.exports.authUser = authUser;

/**
 * Verify Phone Number
 * @param userInfo
 * @returns {Promise<*>}
 */
const verifyEmailNumber = async function (userInfo) {
  if (!userInfo.email) {
    TE("Please enter email.");
  }
  if (!userInfo.email_verification_code) {
    TE("Please enter verification code.");
  }

  let user, err;
  [err, user] = await to(
    User.findOne({
      $and: [
        { email: userInfo.email },
        { email_verification_code: userInfo.email_verification_code },
      ],
    })
  );

  if (!user) {
    TE("Invalid verification code or email number");
  }

  user.is_email_verified = true;
  [err, user] = await to(user.save());

  if (err) {
    TE(err.message);
  }

  return user;
};
module.exports.verifyEmailNumber = verifyEmailNumber;

/**
 * Resend verification code
 * @param userInfo
 * @returns {Promise<*>}
 */
const resendVerification = async function (userInfo) {
  if (!userInfo.email) {
    TE("Please enter email.");
  }

  let user, err, success;
  [err, user] = await to(User.findOne({ email: userInfo.email }));

  if (!user) {
    TE("Invalid email");
  }

  user.email_verification_code = userHelper.generateVerificationCode();
  [err, user] = await to(user.save());

  if (err) {
    TE(err.message);
  } else {
    try {
      [err, success] = await to(sendEmailVerificationCode(user));
      if (err) TE("Error in sending SMS");
      console.debug(success);
    } catch (error) {
      TE(error);
    }
  }

  return user;
};
module.exports.resendVerification = resendVerification;

/**
 * Get Reset password code
 * @param userInfo
 * @returns {Promise<*>}
 */
const getResetPasswordCode = async function (userInfo) {
  if (!userInfo.email) {
    TE("Please enter email.");
  }

  let user, err, success;
  [err, user] = await to(User.findOne({ email: userInfo.email }));

  if (!user) {
    TE("Invalid email");
  }

  user.reset_password_code = userHelper.generatePasswordResetCode();
  [err, user] = await to(user.save());

  if (err) {
    TE(err.message);
  } else {
    try {
      [err, success] = await to(sendPasswordResetCode(user));
      if (err) TE("Error in sending Email");
      console.debug(success);
    } catch (error) {
      TE(error);
    }
  }

  return user;
};
module.exports.getResetPasswordCode = getResetPasswordCode;

/*
------Util Functions------
 */

/**
 * Get Unique key from Request Body
 * @param body
 * @returns {*}
 */
const getUniqueKeyFromBody = function (body) {
  let unique_key = body.unique_key;
  if (typeof unique_key === "undefined") {
    if (typeof body.email != "undefined") {
      unique_key = body.email;
    } else {
      unique_key = null;
    }
  }

  return unique_key;
};
module.exports.getUniqueKeyFromBody = getUniqueKeyFromBody;

/**
 * Send verification code SMS
 * @param user
 */
const sendEmailVerificationCode = async function (user) {
  //@ToDo
  //Send Email
};

/**
 * Send verification code SMS
 * @param user
 */
const sendPasswordResetCode = async function (user) {
  //@ToDo
  //Send Email
};
