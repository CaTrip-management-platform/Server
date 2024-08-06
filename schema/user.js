const typeDefs = `#graphql
    type User {
        _id: String
        phoneNumber: String
        username: String!
        email: String!
        password: String!
        role:String!
    }

    type Response {
        message: String
    }

    type LoginResponse {
        access_token: String
    }

    type Query {
        findUsers: [User]
        findUsersByUsername(username:String): [User]
        findUserById(_id:String): User
    }
    
    type Mutation {
        createUser(phoneNumber:String, username:String, email:String, password:String, role:String): User
        deleteUser(name: String): Response
        login(username: String, password:String): LoginResponse
    }
`

module.exports = typeDefs