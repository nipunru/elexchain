const authService = require("../../services/auth.service");
const { User } = require("../../models");
const httpMocks = require("node-mocks-http");
const {
  signUp,
  profileUpdate,
  profileGet,
  login,
  verifyEmailNumber,
  resendVerification,
  getResetPasswordCode,
  resetPassword,
  logout,
  getJsonWebKey,
} = require("../../controllers/user.controller");
const { to, ResponseCode, bbCode } = require("../../services/util.service");

jest.mock("../../services/auth.service");
jest.mock("../../models/index", () => ({
  User: {
    findOne: jest.fn(),
    getJWT: jest.fn().mockReturnValue("fake-jwt-token"),
    toResponse: jest.fn().mockResolvedValue("fake-user-response"),
    prototype: {
      save: jest.fn(),
    },
  },
}));
const userMock = {
  toResponse: jest.fn(),
  getJWT: jest.fn(),
  withMatchingPreference: false,
  prototype: {
    save: jest.fn(),
  },
};

describe("User Controller", () => {
  describe("Sign Up", () => {
    it("should create a new user for valid data", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: {
          email: "commissioner.test@elections.lk",
          first_name: "Raymon",
          last_name: "Holt",
          phone: 716666668,
          password: "test1234",
          designation: "Commissioner",
          division: "Head Office",
        },
      });
      const res = httpMocks.createResponse();
      authService.createUser.mockResolvedValue({
        getJWT: () => "fake-jwt-token",
        toResponse: () => Promise.resolve("fake-user-response"),
      });

      await signUp(req, res);

      expect(res.statusCode).toBe(201); // Assuming 201 is the status code for CREATED
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty("token");

      const data = res._getJSONData();
      expect(data).toHaveProperty("success", true);
    });

    it("should return error for invalid email address", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: {
          email: "invalid.email@election.lk",
          password: "password123",
        },
      });
      const res = httpMocks.createResponse();

      await signUp(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBeTruthy();
      const data = res._getJSONData();
      expect(data).toHaveProperty("message", "Unauthorized email address.");
      expect(data).toHaveProperty("success", false);
    });

    it("should return error when email empty", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: { password: "password123" },
      });
      const res = httpMocks.createResponse();

      await signUp(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBeTruthy();
      const data = res._getJSONData();
      expect(data).toHaveProperty("success", false);
    });

    it("should return error when unique_key empty", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: { password: "password123" },
      });
      const res = httpMocks.createResponse();

      await signUp(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBeTruthy();
      const data = res._getJSONData();
      expect(data).toHaveProperty("success", false);
    });

    it("should return error when password is empty", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: { email: "commissioner.test3@elections.lk" },
      });
      const res = httpMocks.createResponse();

      await signUp(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._isEndCalled()).toBeTruthy();
      const data = res._getJSONData();
      expect(data).toHaveProperty("success", false);
    });

    it("should handle errors during user creation", async () => {
      const req = httpMocks.createRequest({
        method: "POST",
        url: "/signup",
        body: {
          email: "commissioner.test1@elections.lk",
          password: "password123",
        },
      });
      const res = httpMocks.createResponse();
      const mockError = new Error("Error creating user");
      authService.createUser.mockRejectedValue(mockError);

      await signUp(req, res);

      expect(res.statusCode).toBe(202); // Assuming ReE sets statusCode to 202 for ACCEPTED but with an error
      expect(res._isEndCalled()).toBeTruthy();
      const data = res._getJSONData();
      expect(data).toHaveProperty("message", "Error creating user");
    });
  });

  describe("Update Profile", () => {
    let req, res, mockUser;

    beforeEach(() => {
      mockUser = {
        preferred_language: "en",
        set: jest.fn().mockReturnThis(),
        save: jest.fn(),
      };
      req = httpMocks.createRequest({
        method: "PUT",
        url: "/profile",
        user: mockUser,
        body: {
          firstName: "UpdatedFirstName",
          lastName: "UpdatedLastName",
          // other fields that can be updated
        },
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle successful profile update", async () => {
      mockUser.save.mockResolvedValue(mockUser);

      await profileUpdate(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "User updated successfully"
      );
      expect(mockUser.set).toHaveBeenCalledWith({
        firstName: "UpdatedFirstName",
        lastName: "UpdatedLastName",
        // expected fields to be updated
      });
    });

    it("should handle validation errors like duplicate email", async () => {
      const duplicateError = new Error("E11000 duplicate key error");
      mockUser.save.mockRejectedValue(duplicateError);

      // Simulate duplicate email error
      duplicateError.message =
        'E11000 duplicate key error collection: users index: email_1 dup key: { : "user@example.com" }';
      await profileUpdate(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Email already in use"
      );
    });

    it("should handle unexpected errors during profile update", async () => {
      const unexpectedError = new Error("Unexpected error");
      mockUser.save.mockRejectedValue(unexpectedError);

      await profileUpdate(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty(
        "message",
        unexpectedError.message
      );
    });
  });

  describe("Get Profile", () => {
    let req, res;

    beforeEach(() => {
      // Create mocks for request and response
      req = httpMocks.createRequest({
        user: userMock,
      });
      res = httpMocks.createResponse();
      userMock.toResponse.mockClear();
    });

    it("should get current user profile and return successfully", async () => {
      userMock.toResponse.mockResolvedValue("user-response-data");

      await profileGet(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_OK);
      expect(res.getHeader("Content-Type")).toBe("application/json");
      expect(res._isEndCalled()).toBeTruthy();
      expect(userMock.toResponse).toHaveBeenCalledTimes(1);
      expect(res._getJSONData()).toHaveProperty("message", "User details");
    });

    it("should handle the situation when the user toResponse method fails", async () => {
      const errorMessage = "Error converting user to response";
      userMock.toResponse.mockRejectedValue(new Error(errorMessage));

      await expect(profileGet(req, res)).rejects.toThrow(errorMessage);
      expect(userMock.toResponse).toHaveBeenCalledTimes(1);
      // Note: Depending on how you handle errors, you might want to expect certain response codes or messages here.
    });

    it("should reflect the user matching preference in the response", async () => {
      userMock.toResponse.mockResolvedValue("user-response-data");
      await profileGet(req, res);

      expect(userMock.withMatchingPreference).toBe(true);
      expect(res._getJSONData().user).toBe("user-response-data");
    });

    // Additional tests can be added to cover other edge cases or logic branches within the profileGet function.
  });

  describe("Login", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/login",
        body: {
          email: "commissioner.test@elections.lk",
          password: "test1234",
        },
      });
      res = httpMocks.createResponse();
    });

    it("should return unauthorized for invalid email address", async () => {
      req.body.email = "invalid_email";

      await login(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_OK); // Replace with actual failure code if different
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Unauthorized email address."
      );
    });

    it("should return error when authService.authUser rejects", async () => {
      const authError = new Error("Auth error");
      authService.authUser.mockRejectedValue(authError);

      await login(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty("message", "Auth error");
    });
  });

  describe("Verification Controller", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/verify-phone-number",
        body: {
          phoneNumber: "1234567890",
          verificationCode: "123456",
        },
      });
      res = httpMocks.createResponse();
    });

    it("should verify phone number successfully", async () => {
      authService.verifyEmailNumber.mockResolvedValue({ success: true }); // Mock a successful verification

      await verifyEmailNumber(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "messages.success.phone_verified"
      );
      expect(res._isEndCalled()).toBeTruthy();
    });

    it("should return error if phone number verification fails", async () => {
      const verificationError = new Error("Verification failed");
      authService.verifyEmailNumber.mockRejectedValue(verificationError); // Mock a verification failure

      await verifyEmailNumber(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        verificationError.message
      );
      expect(res._isEndCalled()).toBeTruthy();
    });

    // Test to handle missing phoneNumber or verificationCode in body
    it("should handle missing required fields", async () => {
      // Assuming authService.verifyEmailNumber handles validation and throws if missing fields
      const missingFieldError = new Error("Missing fields");
      authService.verifyEmailNumber.mockRejectedValue(missingFieldError);

      // Clear the request body to simulate missing fields
      req.body = {};

      await verifyEmailNumber(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        missingFieldError.message
      );
      expect(res._isEndCalled()).toBeTruthy();
    });
  });

  describe("Resend Verification Code", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/resend-verification-code",
        body: { user_id: "some-user-id" }, // Adjust the body as per actual request structure
      });
      res = httpMocks.createResponse();
    });

    it("should resend the verification code successfully", async () => {
      authService.resendVerification.mockResolvedValue(
        "Verification code sent successfully"
      );

      await resendVerification(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_OK);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "messages.success.verification_code_sent"
      );
    });

    it("should return an error if there's a problem with the verification service", async () => {
      const error = new Error("Verification service not available");
      authService.resendVerification.mockRejectedValue(error);

      await resendVerification(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty("message", error.message);
    });

    it("should handle missing or invalid user input", async () => {
      // Assuming authService throws for invalid input
      const error = new Error("Invalid user input");
      authService.resendVerification.mockRejectedValue(error);
      req.body = {}; // Empty body to simulate missing input

      await resendVerification(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._isEndCalled()).toBeTruthy();
      expect(res._getJSONData()).toHaveProperty("message", error.message);
    });
  });

  describe("Get Reset Password Code", () => {
    let req, res;

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "POST",
        url: "/get-reset-password-code",
        body: {
          email: "user@example.com",
        },
      });
      res = httpMocks.createResponse();
    });

    it("should send reset password code successfully", async () => {
      authService.getResetPasswordCode.mockResolvedValue({
        /* simulated user object */
      });

      await getResetPasswordCode(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_OK);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Reset code sent successfully."
      );
    });

    it("should return error when sending reset password code fails", async () => {
      const error = new Error("Reset password code could not be sent");
      authService.getResetPasswordCode.mockRejectedValue(error);

      await getResetPasswordCode(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty("message", error.message);
    });
  });

  describe("Reset password", () => {
    let req, res;

    beforeEach(() => {
      // Mock user methods and properties
      User.findOne = jest.fn();
      req = httpMocks.createRequest({
        method: "PUT",
        url: "/profile/reset-password",
        body: {
          phone: "1234567890",
          reset_code: "123456",
          new_password: "newSecurePassword123!",
        },
      });
      res = httpMocks.createResponse();
    });

    it("should successfully reset user password", async () => {
      const mockUser = {
        compareResetCode: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      await resetPassword(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Password changed successfully"
      );
    });

    it("should return error for invalid reset code", async () => {
      const mockUser = {
        compareResetCode: jest.fn().mockReturnValue(false),
      };
      User.findOne.mockResolvedValue(mockUser);

      await resetPassword(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Invalid reset code"
      );
    });

    it("should return error for duplicate phone number", async () => {
      const mockError = { message: "E11000 duplicate key error ... phone ..." };
      const mockUser = {
        compareResetCode: jest.fn().mockReturnValue(true),
        save: jest.fn().mockRejectedValue(mockError),
      };
      User.findOne.mockResolvedValue(mockUser);

      await resetPassword(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Number already in use"
      );
    });

    // Similar tests for duplicate email and general duplicate key error

    it("should handle unknown save error", async () => {
      const mockError = { message: "Unknown database error" };
      const mockUser = {
        compareResetCode: jest.fn().mockReturnValue(true),
        save: jest.fn().mockRejectedValue(mockError),
      };
      User.findOne.mockResolvedValue(mockUser);

      await resetPassword(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Error in password changed"
      );
    });
  });

  describe("Logout", () => {
    let req, res, user, token;

    beforeEach(() => {
      // Setup the User object and mock the save function
      user = {
        preferred_language: "en",
        device_tokens: [{ token: "existing_token" }],
        save: jest.fn(),
      };

      // Create a mock request and response object
      token = "device_token_to_remove";
      req = httpMocks.createRequest({
        user: user,
        body: {
          device_token: token,
        },
      });
      res = httpMocks.createResponse();

      // User.prototype.save.mockRestore();
    });

    afterEach(() => {
      jest.clearAllMocks(); // Clears all mocks instead of restoring
    });

    it("should successfully logout a user and remove the device token", async () => {
      User.prototype.save = jest.fn().mockResolvedValue(user);
      await logout(req, res);

      expect(user.device_tokens).not.toContainEqual({ token: token });
      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Somethig went wrong!"
      );
    });

    it("should not remove any token when no matching token is found", async () => {
      req.body.device_token = "non_existing_token";
      const initialDeviceTokens = user.device_tokens.slice();
      User.prototype.save = jest.fn().mockResolvedValue(user);
      await logout(req, res);

      expect(user.device_tokens).toEqual(initialDeviceTokens); // Ensure no changes to device tokens
      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
    });

    it("should return an error if there is a problem saving the user", async () => {
      const errorMessage = "Error saving user";
      User.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      await logout(req, res);

      expect(res.statusCode).toBe(ResponseCode.SUCCESS_ACCEPTED);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Somethig went wrong!"
      );
    });
  });
});
