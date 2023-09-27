let _ = require("lodash");

module.exports.transform = async function (ret) {
  //basic
  ret.first_name = ret.first_name === undefined ? null : ret.first_name;
  ret.last_name = ret.last_name === undefined ? null : ret.last_name;
  ret.designation = ret.designation === undefined ? "" : ret.designation;
  ret.division = ret.division === undefined ? "" : ret.division;
  
  //rename
  ret.id = ret._id;
  
  //delete
  delete ret.created_at;
  delete ret.updated_at;
  delete ret.password;
  delete ret.phone;
  delete ret._id;
  delete ret.__v;
  delete ret.email_verification_code;
  delete ret.reset_password_code;
  delete ret.email;
  delete ret.is_email_verified;
  delete ret.auth_method;
  return ret;
};
