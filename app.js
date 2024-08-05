require('dotenv').config()
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const userTypeDefs = require(`./schema/user`)
const userResolver = require(`./resolvers/user`)


const { GraphQLError } = require("graphql");
const { verifyToken } = require('./helpers/jwt')


const server = new ApolloServer({
    typeDefs: userTypeDefs,
    resolvers: userResolver,
    introspection: true
})

startStandaloneServer(server, {
    listen: { port: process.env.PORT || 3000 },
    context: async ({ req, res }) => {
        return {
            authentication: async () => {
                try {
                    let access_token = req.headers.authorization
                    if (!access_token) {
                        throw new GraphQLError("Unauthenticated")
                    }
                    let token = access_token.split(" ")[1]
                    let payload = verifyToken(token)
                    if (payload == undefined) {
                        throw new GraphQLError("You are not logged in")
                    }
                    return payload
                }
                catch(err){
                    console.log(err)
                }
                

            }
        }
    }
})
    .then(({ url }) => {
        console.log(`Server ready at: ${url}`)
    })
    .catch(err => console.log(err))