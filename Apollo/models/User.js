const { DB } = require(`../config/db`);
const { hashPassword, checkPassword } = require("../helpers/bcryptjs");
const { z } = require("zod");
const { GraphQLError } = require("graphql");
const jwt = require(`jsonwebtoken`);
const { ObjectId } = require("mongodb");

class User {
  //validation zod
  static userSchema = z.object({
    phoneNumber: z.string(),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    password: z.string().min(5, "Password must be at least 5 characters long"),
  });

  static async create({ phoneNumber, username, email, password }) {
    const validationResult = User.userSchema.safeParse({
      phoneNumber,
      username,
      email,
      password,
    });

    if (!validationResult.success) {
      throw new GraphQLError(validationResult.error.errors[0].message);
    }

    const userCollection = DB.collection("users");

    const existingUsername = await userCollection.findOne({ username });
    if (existingUsername) {
      throw new GraphQLError("Username already exists");
    }
    console.log("test");
    const existingEmail = await userCollection.findOne({ email });
    if (existingEmail) {
      throw new GraphQLError("Email already exists");
    }

    password = hashPassword(password);
    let result = await userCollection.insertOne({
      phoneNumber,
      username,
      email,
      password,
      role: "customer",
    });
    console.log(await userCollection.findOne({ _id: result.insertedId }));
    return await userCollection.findOne({ _id: result.insertedId });
  }

  static async login({ username, password }) {
    if (!username) {
      throw new GraphQLError("Username is required");
    }
    if (!password) {
      throw new GraphQLError("Password is required");
    }

    const userCollection = DB.collection("users");

    let user = await userCollection.findOne({ username: username });
    if (!user) {
      throw new GraphQLError("Invalid Username/Password");
    }
    if (!checkPassword(password, user.password)) {
      throw new GraphQLError("Invalid Username/Password");
    }
    let token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    console.log({ _id: user._id, role: user.role, username, token });
    return { access_token: token, id: user._id, role: user.role };
  }
  static async findUserById(id) {
    const userCollection = DB.collection("users");
    let user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw new GraphQLError("User not found");
    }
    return user;
  }
}

module.exports = User;
