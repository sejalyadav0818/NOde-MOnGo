const request = require("supertest");
const app = require("../index");
const Constants = require("../src/utils/constants");

//User APis
describe("User API", () => {
  let createdUserId = "6571ad0be50e759cfbf07843"; //chnage

  test("should create a new user", async () => {
    const response = await request(app).post("/create-user").send({
      username: "popopp",
      email: "popopp@gmail.com",
      password: "popopp@1235",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe(Constants.CREATED_SUCCESSFULLY);
    expect(response.body.user.username).toBe("popop");
  }, 50000);

  test("should handle missing fields", async () => {
    const response = await request(app).post("/create-user").send({
      // Omitting required fields (username, email, password)
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Missing fields");
  }, 50000);

  test("should handle duplicate email", async () => {
    // Assuming 'omom' already exists in the database
    const response = await request(app).post("/create-user").send({
      username: "newuser134556",
      email: "newuser134556@example.com",
      password: "newpassword134556",
    });

    //Check for the expected error response
    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Email is already in use");
  }, 50000);

  test("should get a user by ID", async () => {
    const response = await request(app).get(`/get-user/${createdUserId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Data retrieved successfully");
    expect(response.body.data.user._id).toBe(createdUserId);
  }, 50000);

  test("should get all users", async () => {
    const response = await request(app).get("/get-users");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Data retrieved successfully");
  }, 50000);

  test("should update a user", async () => {
    const response = await request(app)
      .put(`/update-user/${createdUserId}`)
      .send({
        username: "updatedUsername1246668i", //chnage thsi also
        email: "updated@example1246668i.com",
        password: "updatedPassword126468i",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Data updated successfully");
    expect(response.body.data.user._id).toBe(createdUserId);
    expect(response.body.data.user.username).toBe("updatedUsername1246668i");
    expect(response.body.data.user.email).toBe("updated@example1246668i.com");
  }, 50000);

  test("should delete a user", async () => {
    const response = await request(app).delete(`/delete-user/${createdUserId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Data deleted successfully");
  }, 50000);

  test("should handle registration with existing email", async () => {
    // Assuming 'existinguser@example.com' already exists in the database
    const response = await request(app).post("/register").send({
      username: "kk",
      email: "kk@gmail.com",
      password: "Kk@12345",
    });

    expect(response.statusCode).toBe(409);
    // expect(response.body.error).toBe("Email is already in use");
  }, 50000);

  test("should log in with valid credentials", async () => {
    // Assuming 'testuser@example.com' exists in the database with password 'testpassword'
    const response = await request(app).post("/login").send({
      email: "kk@gmail.com",
      password: "Kk@12345",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User logged in successfully");
  }, 50000);

  test("should handle login with invalid credentials", async () => {
    const response = await request(app).post("/login").send({
      email: "nonexistentuser@exampddle.com",
      password: "invalidpassworddd",
    });

    expect(response.statusCode).toBe(401);
  }, 50000);
});

//post APis
describe("Post API", () => {
  let createdUserId = "6571abf0700f17019edfcd47";

  test("should create a new post", async () => {
    const response = await request(app).post("/create-post").send({
      title: "lastpost",
      content: "lastpostcom", // Update this line
      userId: createdUserId,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("lastpost");
    expect(response.body.content).toBe("lastpostcom"); // Update this line
  }, 50000);

  test("should get posts by user ID", async () => {
    const response = await request(app).get(`/get-post/${createdUserId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Data retrieved successfully");
  }, 5000);
});

//auth Apis
describe("home endpoint", () => {
  let authToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTcyZTIzYTAwYzcwMDIwMTRmMTc1NDUiLCJpYXQiOjE3MDIwMjc4ODksImV4cCI6MTcwMjAzMTQ4OX0.FyVRHn3GP9KUrl5rXI7-51-tD3_f3X1rEWTA9qrQr6U"; // Store the authentication token for later use

  beforeAll(async () => {
    const loginResponse = await request(app).post("/login").send({
      email: "user@example.com",
      password: "userpassword123",
    });
  });

  it("should return a list of users when authenticated", async () => {
    const response = await request(app)
      .get("/home")
      .set("Authorization", `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("should return an authentication error when not authenticated", async () => {
    const response = await request(app).get("/home");
    expect(response.status).toBe(401);
  });
});
