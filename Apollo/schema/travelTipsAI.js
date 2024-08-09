const typeDefs = `#graphql

  type TravelSupportResponse {
    message: String!
  }

  type Query {
    getTravelSupport(message: String!): TravelSupportResponse!
  }
`;

module.exports = typeDefs;