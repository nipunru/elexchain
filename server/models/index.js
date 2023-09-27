const fs = require("fs");
const path = require("path");
// eslint-disable-next-line no-undef
const basename = path.basename(__filename);
const models = {};
const mongoose = require("mongoose");
const CONFIG = require("../config/config");
const { log } = require("../services/log.service");

const snakeToCamel = (str) => str.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace("-", "").replace("_", ""));

const { db_server, db_user, db_password, db_host, db_port, db_name } = CONFIG;

/**
 * DB Connection for modules
 */
if (CONFIG.db_host !== "") {
  // eslint-disable-next-line no-undef
  fs.readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    })
    .forEach((file) => {
      let model_name = snakeToCamel(file.split(".")[0]);
      model_name = model_name.charAt(0).toUpperCase() + model_name.slice(1);
      models[model_name] = require("./" + file);
    });

  mongoose.Promise = global.Promise; //set mongo up to use promises

  if (db_server === "atlas") {
    const mongo_location = "mongodb+srv://" + db_user + ":" + db_password + "@" + db_host;
    mongoose.connect(mongo_location, { dbName: db_name }).catch((err) => {
      log.error("*** Can not Connect to Atlas Mongo Server:", err);
    });
  } else if (db_server === "replica") {
    const mongo_location = "mongodb://" + db_user + ":" + db_password + "@" + db_host;
    mongoose.connect(mongo_location, { dbName: db_name }).catch((err) => {
      log.error("*** Can not Connect to Mongo Replica Set:", err);
    });
  } else {
    const prefix = db_user && db_password ? `${db_user}:${db_password}@` : "";
    const mongo_location = "mongodb://" + prefix + db_host + ":" + db_port + "/" + db_name;
    mongoose.connect(mongo_location, { useNewUrlParser: true, useUnifiedTopology: true }).catch((err) => {
      log.error("*** Can not Connect to Local Mongo Server:", err);
    });
  }
  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  //mongoose.set('debug', true);

  let db = mongoose.connection;
  module.exports = db;
  db.once("open", () => {
    log.info("Connected to mongo");
  });
  db.on("error", (error) => {
    log.error("error", error);
  });
  // End of Mongoose Setup
} else {
  log.error("No Mongo Credentials Given");
}

module.exports = models;
