const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");
const bcrypt = require("bcrypt");
const bcrypt_p = require("bcrypt-promise");
const jwt = require("jsonwebtoken");
const validate = require("mongoose-validator");
const { TE, to } = require("../services/util.service");
const CONFIG = require("../config/config");
const userTransformer = require("../transforms/user.transform");

const { languagesKeys } = require("../locales");

let UserSchema = mongoose.Schema(
  {
    first_name: { type: String },
    last_name: { type: String },
    phone: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      validate: [
        validate({
          validator: "isNumeric",
          arguments: [7, 20],
          message: "Not a valid phone number.",
        }),
      ],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      validate: [
        validate({
          validator: "isEmail",
          message: "Not a valid email.",
        }),
      ],
    },
    password: { type: String },
    designation: { type: String },
    division: { type: String },
    is_email_verified: { type: Boolean, default: true },
    email_verification_code: { type: Number },
    reset_password_code: { type: Number },
    auth_method: { type: String },
    preferred_language: { type: String, default: "en" },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    let err, salt, hash;
    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(this.password, salt));
    if (err) TE(err.message, true);

    this.password = hash;
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = async function (pw) {
  let err, pass;
  if (!this.password) TE("password not set");

  [err, pass] = await to(bcrypt_p.compare(pw, this.password));
  if (err) TE(err);

  if (!pass) TE("Incorrect Credentials");

  return this;
};

UserSchema.methods.compareResetCode = function (resetCode) {
  if (this.reset_password_code == resetCode) {
    return true;
  } else {
    return false;
  }
};

UserSchema.methods.getJWT = function () {
  let expiration_time = parseInt(CONFIG.jwt_expiration);
  // eslint-disable-next-line no-undef
  let secret = Buffer.from(CONFIG.jwt_encryption, "base64");
  return jwt.sign(
    {
      user_id: this._id,
    },
    secret,
    {
      expiresIn: expiration_time,
      algorithm: CONFIG.jwt_algorithm,
      keyid: CONFIG.jwt_key_id,
    }
  );
};

UserSchema.methods.toResponse = async function () {
  return await this.toJSON();
};

UserSchema.options.toJSON = {
  transform: async function (doc, ret, options) {
    return await userTransformer.transform(ret);
  },
};

UserSchema.plugin(mongoosePaginate);

// eslint-disable-next-line no-unused-vars
let User = (module.exports = mongoose.model("User", UserSchema));
