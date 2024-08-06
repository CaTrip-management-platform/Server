const User = require("../models/User")

const resolvers = {
    Query: {
        findUsers: async () => {
            const data = await User.findAll()
            return data
        },
        findUsersByUsername: async(_,args) =>{
            const result = await User.findUsersByUsername(args)
            return result
        },
        findUserById: async(_,args) =>{
            const result = await User.findUserById(args)
            return result
        }
    },
    Mutation: {
        createUser: async (_,args) => {
            const data = await User.create(args)
            return data
        },
        login: async(_,args) =>{
            const result = await User.login(args)
            return { access_token: result }
        }
    }
}

module.exports = resolvers