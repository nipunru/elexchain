const AWS = require("aws-sdk");
const CONFIG = require("../config/config");
const { log } = require("./log.service");
const { User } = require("../models/index");
const { to } = require("./util.service");

/**
 * Send SMS using AWS-SNS
 * @param to_number
 * @param message
 * @param subject
 */
class SqsService {
  constructor() {
    /**
     * AWS Config
     */
    let accessKeyId = CONFIG.aws_access_key_id;
    let secretAccessKey = CONFIG.aws_secret_access_key;

    //Get from AWS Secret Manager
    if (CONFIG.aws_access_keys != null) {
      try {
        let awsKeys = JSON.parse(CONFIG.aws_access_keys);
        accessKeyId = awsKeys.AWS_ACCESS_KEY_ID;
        secretAccessKey = awsKeys.AWS_SECRET_ACCESS_KEY;
      } catch (error) {
        log.error("Error in get from AWS Secret Manager:", error);
      }
    }

    AWS.config.accessKeyId = accessKeyId;
    AWS.config.secretAccessKey = secretAccessKey;
    AWS.config.region = CONFIG.aws_region;
  }

  async sendEmail(toEmails, template, data, ccEmails, bccEmails) {
    const params = {
      QueueUrl: CONFIG.sqs_email_queue_url,
      MessageAttributes: {
        sourceEmail: {
          DataType: "String",
          StringValue: CONFIG.source_email_address,
        },
        template: {
          DataType: "String",
          StringValue: template,
        },
        templateData: {
          DataType: "String",
          StringValue: JSON.stringify(data),
        },
        toEmails: {
          DataType: "String.Array",
          StringValue: JSON.stringify(toEmails),
        },
        ccEmails: {
          DataType: "String.Array",
          StringValue: JSON.stringify(ccEmails),
        },
        bccEmails: {
          DataType: "String.Array",
          StringValue: JSON.stringify(bccEmails),
        },
      },
      MessageBody: template,
    };

    try {
      return new Promise(function (resolve, reject) {
        const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
        sqs.sendMessage(params, (err, data) => {
          if (err) {
            console.error("Error", err);
            reject(false);
          } else {
            console.log("Successfully added message", data.MessageId);
            resolve(true);
          }
        });
      });
    } catch (e) {
      console.error(e);
      log.error("Send Email Error: ", e);
      return false;
    }
  }

  async revokeToken(token) {
    let ttl = parseInt(CONFIG.jwt_expiration);
    const params = {
      QueueUrl: CONFIG.sqs_token_revoke_queue_url,
      MessageAttributes: {
        token: {
          DataType: "String",
          StringValue: token,
        },
        ttl: {
          DataType: "String",
          StringValue: String(ttl),
        },
      },
      MessageBody: "Revoking Token",
    };

    try {
      return new Promise(function (resolve, reject) {
        const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
        sqs.sendMessage(params, (err, data) => {
          if (err) {
            console.error("Error", err);
            reject(false);
          } else {
            console.log("Successfully added revoke token", data.MessageId);
            resolve(true);
          }
        });
      });
    } catch (e) {
      console.dir(e);
      log.error("Token revoking error: ", e);
      return false;
    }
  }
}

class Singleton {
  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = new SqsService();
    }
  }

  getInstance() {
    return Singleton.instance;
  }
}

module.exports = Singleton;
