const request = require("supertest");
const app = require("../../../app");
const { mockUserModel } = require("../../../utils/mocks/Users");
const { STATUS_CODES } = require("http");

const UsersService = require("../../../services/User");
const UserTokenService = require("../../../services/UserToken");

jest.mock("../../../services/User", () =>({
  fetchUserByEmail: jest.fn(),
  updateUser: jest.fn(),
}));

jest.mock("../../../services/UserToken", () =>({
  createVerifyToken: jest.fn(),
}));




describe("UpdateProfile Controller", () => {
  describe("Payload", () => {
    beforeAll(() => {
      process.env.JWT_SECRET = "my_secret";
    });
    afterAll(() =>{
      delete process.env.JWT_SECRET;
    });

    it("should return 422 when Email is missing", async () => {
      const mockToken = mockUserModel.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"email\" is required",
        message: "Unprocessable Entity",
        status: 422,
      });
    }, 5000);

    it("should return 422 when firstName is missing", async () => {
      const mockToken = mockUserModel.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          lastName: "Rider",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"firstName\" is required",
        message: "Unprocessable Entity",
        status: 422,
      });
    }, 5000);

    it("should return 422 when lastName is missing", async () => {
      const mockToken = mockUserModel.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          newEmail: "ghosty@rider.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"lastName\" is required",
        message: "Unprocessable Entity",
        status: 422,
      });
    }, 5000);

    it("should return 422 when firstName or lastName contains special characters or numbers", async () => {
      const mockToken = mockUserModel.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty1",
          lastName: "Rider@",
          newEmail: "ghostidergod@gmail.com",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "firstName should not contain any special character or number",
        message: "Unprocessable Entity",
        status: 422,
      });
    }, 5000);

    it("should return 422 when Email is not in a valid format", async () => {
      const mockToken = mockUserModel.generateJWT();

      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
          newEmail: "ghostidergod@gmail",
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: "\"email\" is required",
        message: "Unprocessable Entity",
        status: 422,
      });
    }, 5000);

    it("should return 404 when user does not exist", async () => {
      jest.spyOn(UsersService, "fetchUserByEmail").mockImplementation(() => null);
  
      const mockToken = mockUserModel.generateJWT();
  
      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
          email: "ghosty@rider.com",
        });
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 404,
        error: STATUS_CODES[404],
        message: STATUS_CODES[404],
      });
    });

    it("should return 500 when it fails to create a verification token", async () => {
      jest.spyOn(UsersService, "fetchUserByEmail").mockImplementation(() => mockUserModel);
      jest.spyOn(UserTokenService, "createVerifyToken").mockImplementation(() => null);
  
      const mockToken = mockUserModel.generateJWT();
  
      const response = await request(app)
        .post("/update-profile")
        .set("cookie", `jwt=${mockToken}`)
        .send({
          firstName: "Ghosty",
          lastName: "Rider",
          email: "ghosty@rider.com",
        });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual([
        {
          statusCode: 500,
          error: STATUS_CODES[500],
          message: "Failed to create email verification token"
        }
      ]);
    });
  });
});