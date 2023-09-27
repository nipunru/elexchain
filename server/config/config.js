require("dotenv").config();

let CONFIG = {};
CONFIG.app = process.env.APP || "dev";
CONFIG.port = process.env.PORT || "4001";
CONFIG.cors_origin = process.env.CORS_ORIGIN || "*";

CONFIG.db_dialect = process.env.DB_DIALECT || "mongo";
CONFIG.db_host = process.env.DB_HOST || "localhost";
CONFIG.db_server = process.env.DB_SERVER || "atlas";
CONFIG.db_port = process.env.DB_PORT || "27017";
CONFIG.db_name = process.env.DB_NAME || "name";
CONFIG.db_user = process.env.DB_USER || "root";
CONFIG.db_password = process.env.DB_PASSWORD || "db-password";

CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || "jwt_please_change";
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || "10000";
CONFIG.jwt_algorithm = process.env.JWT_ALGORITHM || "HS256";
CONFIG.jwt_key_id = process.env.JWT_KEY_ID || "bbkey";

CONFIG.aws_access_key_id = process.env.AWS_ACCESS_KEY_ID || "xxx";
CONFIG.aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY || "xxx";
CONFIG.aws_access_keys = process.env.AWS_ACCESS_KEYS || null;
CONFIG.aws_region = process.env.AWS_REGION || "us-east-1";

CONFIG.aws_s3_signed_url_expires = process.env.AWS_S3_SIGNED_URL_EXPIRES || "86400";
CONFIG.aws_s3_signed_url_redis_ttl = process.env.AWS_S3_SIGNED_URL_REDIS_TTL || "82800";

CONFIG.sqs_email_queue_url = process.env.SQS_EMAIL_QUEUE_URL || "xxx";
CONFIG.sqs_token_revoke_queue_url = process.env.SQS_TOKEN_REVOKE_QUEUE_URL || "xxx";

CONFIG.source_email_address = process.env.SOURCE_EMAIL_ADDRESS || "noreply@ilios.co";

CONFIG.log_path = process.env.LOG_PATH || "/logs";
CONFIG.log_driver = process.env.LOG_DRIVER || "console";

CONFIG.firebase_app_env = process.env.FIREBASE_APP_ENV || "dev";

module.exports = CONFIG;
