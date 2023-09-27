let logger;

class Logger {
  constructor() {
    logger = console;
  }

  getLogger() {
    return logger;
  }
}

module.exports.log = new Logger().getLogger();
