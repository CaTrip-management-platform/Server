const typeDefs = `#graphql
    type User {
        _id: String
        name: String
        username: String!
        email: String!
        password: String!
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
        createUser(name:String, username:String, email:String, password:String): User
        deleteUser(name: String): Response
        login(username: String, password:String): LoginResponse
    }
`

module.exports = typeDefs