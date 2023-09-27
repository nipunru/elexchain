const express = require("express");
const router = express.Router();
/**
 * Controllers
 */
const UserController = require("../controllers/user.controller");

/**
 * Auth Token
 * @type {Passport}
 */
const { authenticate } = require("../middleware/passport");

/* GET home page. */
router
  .get("/", function (req, res, next) {
    console.debug(next);
    res.json({
      status: "success",
      message: "User Service API",
      data: { version_number: "v1.0.0" },
    });
  });

/**
 * Auth Routes
 */
router
  .post("/signup", UserController.signUp);
router
  .post("/login", UserController.login);
router
  .post("/logout", UserController.logout);
router
  .get("/jwk", UserController.getJsonWebKey);

/**
 * Profile Routes
 */
router
  .get("/profile", authenticate, UserController.profileGet);
router
  .put("/profile", authenticate, UserController.profileUpdate);
router
  .post("/verify-phone-number", UserController.verifyEmailNumber);
router
  .post("/resend-verification-code", UserController.resendVerification);
router
  .post("/get-reset-password-code", UserController.getResetPasswordCode);
router
  .post("/reset-password", UserController.resetPassword);

module.exports = router;
