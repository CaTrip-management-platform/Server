const { createTrip } = require("../models/Trip");

const resolvers = {
  Query: {},
  Mutation: {
    addTrip: async (_, { tripInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      //   console.log(tripInput, customerId);
      const result = await createTrip(tripInput, customerId);

      if (result.acknowledged) {
        return { message: "success add a new trip" };
      } else {
        return { message: "failed to add a new trip" };
      }
    },
  },
};

module.exports = resolvers;
