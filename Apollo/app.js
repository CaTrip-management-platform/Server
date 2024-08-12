require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const userTypeDefs = require(`./schema/user`);
const userResolver = require(`./resolvers/user`);
const activityTypeDefs = require(`./schema/activity`);
const activityResolver = require(`./resolvers/activity`);
const tripTypeDefs = require("./schema/trip");
const tripResolver = require("./resolvers/trip");
const travelSupportTypeDefs = require("./schema/travelTipsAI")
const travelSupportTResolvers = require("./resolvers/travelTipsAI")

const { GraphQLError } = require("graphql");
const jwt = require(`jsonwebtoken`);

const server = new ApolloServer({
  typeDefs: [userTypeDefs, activityTypeDefs, tripTypeDefs, travelSupportTypeDefs],
  resolvers: [userResolver, activityResolver, tripResolver, travelSupportTResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
  context: async ({ req, res }) => {
    return {
      authentication: async () => {
        try {
          let access_token = req.headers.authorization;
          if (!access_token) {
            throw new GraphQLError("Unauthenticated");
          }
          let token = access_token.split(" ")[1];
          let payload = jwt.verify(token, process.env.JWT_SECRET);
          if (payload == undefined) {
            throw new GraphQLError("You are not logged in");
          }
          return payload;
        } catch (err) {
          console.log(err);
        }
      },
    };
  },
})
  .then(({ url }) => {
    console.log(`Server ready at: ${url}`);
  })
  .catch((err) => console.log(err));


