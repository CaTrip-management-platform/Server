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
    role: z.string(),
  });

  static async findAll() {
    const userCollection = DB.collection("users");
    let result = await userCollection.find().toArray();
    return result;
  }

  static async create({ phoneNumber, username, email, password, role }) {
    const validationResult = User.userSchema.safeParse({
      phoneNumber,
      username,
      email,
      password,
      role,
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
      role,
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
    console.log({ _id: user._id, role: user.role });
    return token;
  }

  static async findUsersByUsername({ username }) {
    const userCollection = DB.collection("users");
    let results = await userCollection
      .find({
        username: {
          $regex: new RegExp(username, "i"),
        },
      })
      .toArray();
    console.log(results);
    return results;
  }

  static async findUserById(_id) {
    const userCollection = DB.collection("users");
    console.log(_id);
    let result = await userCollection.findOne({ _id: new ObjectId(_id) });
    return result;
  }
}

module.exports = User;
