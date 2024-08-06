const { createTrip, deleteTrip } = require("../models/Trip");

const resolvers = {
  Query: {},
  Mutation: {
    addTrip: async (_, { tripInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const result = await createTrip(tripInput, customerId);

      return result;
    },

    deleteTrip: async (_, { tripId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await deleteTrip(tripId, customerId);
      return result;
    },
  },
};

module.exports = resolvers;
