
const { createTrip, deleteTrip, addActivityTrip, createPayment, updatePaymentStatus } = require("../models/Trip");



const resolvers = {
  Query: {
    
   
  },

  Mutation: {
    addTrip: async (_, { tripInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;
      const result = await createTrip(tripInput, customerId);
      await redis.del("trips:all");

      return result;
    },

    deleteTrip: async (_, { tripId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await deleteTrip(tripId, customerId);
      await redis.del("trips:all");
      return result;
    },

    addActivityToTrip: async (_, { activityInput }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await addActivityTrip(activityInput, customerId);
      await redis.del("trips:all");

      return result;
    },  
    createPayment: async (_, { tripId, amount }) => {
      const result = await createPayment(tripId, amount)
      return result
    },

    updatePaymentStatus: async (_, { tripId, orderId }) => {
      const result = await updatePaymentStatus(tripId, orderId)
      return result
    },

   
  },



};

module.exports = resolvers;
