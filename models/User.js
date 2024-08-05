const { DB } = require(`../config/db`)
const { hashPassword, checkPassword } = require("../helpers/bcryptjs")
const { z } = require('zod');
const { GraphQLError } = require("graphql");
const { signToken } = require("../helpers/jwt");
const { ObjectId } = require('mongodb')


class User {

    //validation zod
    static userSchema = z.object({
        name: z.string(),
        username: z.string().min(1, "Username is required"),
        email: z.string().email("Invalid email format").min(1, "Email is required"),
        password: z.string().min(5, "Password must be at least 5 characters long")
    });



    static async findAll() {
        const userCollection = DB.collection("users")
        let result = await userCollection.find().toArray()
        return result
    }

    static async create({ name, username, email, password }) {

        const validationResult = User.userSchema.safeParse({ name, username, email, password })

        if (!validationResult.success) {
            throw new GraphQLError(validationResult.error.errors[0].message)
        }

        const userCollection = DB.collection("users")

        const existingUsername = await userCollection.findOne({ username });
        if (existingUsername) {
            throw new GraphQLError("Username already exists");
        }
        console.log("test")
        const existingEmail = await userCollection.findOne({ email });
        if (existingEmail) {
            throw new GraphQLError("Email already exists");
        }


        password = hashPassword(password)
        let result = await userCollection.insertOne({ name, username, email, password })
        console.log(await userCollection.findOne({ _id: result.insertedId }))
        return await userCollection.findOne({ _id: result.insertedId });
    }




    static async destroy({ name }) {
        const userCollection = DB.collection("users")
        let result = await userCollection.deleteMany({ name })
        return `with name ${name} deleted`;
    }





    static async login({ username, password }) {
        if (!username) {
            throw new GraphQLError("Username is required")
        }
        if (!password) {
            throw new GraphQLError("Password is required")
        }

        const userCollection = DB.collection("users")

        let user = await userCollection.findOne({ username: username })
        if (!user) {
            throw new GraphQLError("Invalid Username/Password")
        }
        if (!checkPassword(password, user.password)) {
            throw new GraphQLError("Invalid Username/Password")
        }
        let token = signToken({ _id: user._id })
        console.log({ _id: user._id })
        return token
    }

    static async findUsersByUsername({ username }) {
        const userCollection = DB.collection("users")
        let results = await userCollection.find({ 
            username: { 
                $regex: new RegExp(username, "i")
            } 
        }).toArray()
        console.log(results)
        return results
    }

    static async findUserById({ _id }) {
        const userCollection = DB.collection("users")
        console.log(_id)
        let result = await userCollection.findOne({ _id: new ObjectId(_id) })
        return result
    }
}

module.exports = User