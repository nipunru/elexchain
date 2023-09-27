const AWS = require("aws-sdk");
const CONFIG = require("../config/config");
const { log } = require("./log.service");

/**
 * Send SMS using AWS-SNS
 * @param to_number
 * @param message
 * @param subject
 */
class CloudFrontService {
  constructor() {
    /**
     * AWS Config
     */

    let keyPairId = CONFIG.cloudfront_key_pair_id;
    let encodedPrivateKey = CONFIG.cloudfront_private_key;

    //Get from AWS Secret Manager
    if (CONFIG.aws_access_keys != null) {
      try {
        let awsKeys = JSON.parse(CONFIG.aws_access_keys);
        encodedPrivateKey = awsKeys.AWS_CLOUDFRONT_PRIVATE_KEY;
      } catch (error) {
        log.error("Error in get from AWS Secret Manager:", error);
      }
    }

    // eslint-disable-next-line no-undef
    let privateKey = new Buffer(encodedPrivateKey, "base64").toString("utf8");

    this.cloudFront = new AWS.CloudFront.Signer(keyPairId, privateKey);
  }

  getSignedCookies() {
    let expireTime = new Date().addHours(CONFIG.cloudfront_cookie_expires);
    try {
      const policy = JSON.stringify({
        Statement: [
          {
            Resource: CONFIG.cloudfront_path,
            Condition: {
              DateLessThan: {
                "AWS:EpochTime": expireTime.getUTCTime(),
              },
            },
          },
        ],
      });

      return this.cloudFront.getSignedCookie({
        policy,
      });
    } catch (e) {
      log.error("Cookie Generation Error: ", e);
      return null;
    }
  }
}

class Singleton {
  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new CloudFrontService();
    }
  }

  getInstance() {
    return Singleton.instance;
  }
}

module.exports = Singleton;
