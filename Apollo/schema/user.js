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
        id: String
        role: String
    }

    type Query {
        findUserByUserId(id: String): User
    }
    
    type Mutation {
        createUser(phoneNumber:String, username:String, email:String, password:String): User
        login(username: String, password:String): LoginResponse
    }
`;

module.exports = typeDefs;
