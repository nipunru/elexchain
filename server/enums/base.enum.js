const { locales } = require("../locales/index");

/**
 * Base Enum Cass, All Enum Classes should extend this
 */
class BaseEnum {
  constructor(enumeration, file) {
    this.enumeration = enumeration;
    this.file = file;
  }

  /**
   * Return enum array
   * @returns {*}
   */
  getEnum() {
    return this.enumeration;
  }

  /**
   * Return Translated List
   */
  getList() {
    let list = {};
    this.enumeration.forEach((element) => {
      if (element !== "") {
        list[element] = locales.__("enum." + this.file + "." + element);
      }
    });
    return list;
  }

  /**
   * Return Translated List
   */
  getListOrder() {
    let list = {};
    var i = 0;
    this.enumeration.forEach((element) => {
      if (element !== "") {
        list[element] = i;
        i++;
      }
    });
    return list;
  }
}

module.exports.BaseEnum = BaseEnum;
