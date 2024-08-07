const { createTrip, deleteTrip, addActivityTrip, deleteActivityFromTrip } = require("../models/Trip");

const resolvers = {
  Query: {},
  Mutation: {
    addTrip: async (_, { tripInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;
      const result = await createTrip(tripInput, customerId);

      return result;
    },

    deleteTrip: async (_, { tripId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await deleteTrip(tripId, customerId);
      return result;
    },

    addActivityToTrip: async (_, { activityInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await addActivityTrip(activityInput, customerId);

      return result;
    },
    deleteActivityFromTrip: async (_, { tripId, activityId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await deleteActivityFromTrip(tripId, activityId, customerId);

      return result;
    }
  },
};

module.exports = resolvers;
