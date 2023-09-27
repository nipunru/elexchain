const CONFIG = require("../config/config");
const CryptoJS = require("crypto-js");
const Crypto = require("crypto");

/**
 * Generate Random Verification Code
 * @returns {number}
 */
module.exports.generateVerificationCode = (length=4) => {
  if (CONFIG.app == "dev") {
    if(length === 4){
      return 1234;
    }
    return 12345678;
    
  } else {
    if(length === 4){
      return Math.floor(1000 + Math.random() * 1000);
    }
    return Math.floor(10000000 + Math.random() * 10000000);
  }
};

/**
 * Hash Generation with given data
 * @param data
 * @returns {string}
 */
module.exports.hashGeneration = function (data) {
  return CryptoJS.AES.encrypt(data, CONFIG.jwt_encryption).toString();
};

/**
 * DecryptHash
 * @param data
 * @returns {Request<KMS.DecryptResponse, AWSError> | WordArray | PromiseLike<ArrayBuffer>}
 */
module.exports.decryptHash = function (data) {
  return CryptoJS.AES.decrypt(data, CONFIG.jwt_encryption);
};

/**
 * Encrypt Data
 * @param data
 * @returns {string}
 */
module.exports.createEncryption = function (data) {
  return Crypto.createHash("md5").update(data).digest("hex");
};

/**
 * Generate password reset token
 * @returns {number}
 */
module.exports.generatePasswordResetCode = () => {
  return Crypto.randomBytes(20).toString('hex');
};

class UserHelper {}

UserHelper.AUTH_METHOD_PHONE = "email";
UserHelper.AUTH_METHOD_FACEBOOK = "facebook_token";

module.exports.UserHelper = UserHelper;
