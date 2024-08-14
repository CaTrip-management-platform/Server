const {
  createTrip,
  deleteTrip,
  addActivityTrip,
  getTrips,
  getTripById,
  deleteActivityFromTrip,
  createPayment,
  updatePaymentStatus,
  updateTripDate,
  updateTripActivityQuantity
} = require("../models/Trip");
const redis = require("../config/redis");

const resolvers = {
  Query: {
    getTripsByCustomerId: async (_, __, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;
      const tripsCache = await redis.get("trips:all");
      const result = await getTrips(customerId);
      await redis.set("trips:all", JSON.stringify(result));
      return result;
    },
    getTripById: async (_, { tripId }, contextValue) => {
      await contextValue.authentication();
      const result = await getTripById(tripId);
      return result[0];
    },
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
      const result = await createPayment(tripId, amount);
      return result;
    },

    deleteActivityFromTrip: async (_, { tripId, activityId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await deleteActivityFromTrip(
        tripId,
        activityId,
        customerId
      );

      return result;
    },
    updateTripDate: async (_, { dateInput, tripId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;

      const result = await updateTripDate(dateInput, tripId, customerId);
      return { message: result };
    },
    updateTripActivityQuantity: async (_, { newQuantity, tripId, activityId }, contextValue) => {
      const payload = await contextValue.authentication();
      const customerId = payload.id;
      const result = await updateTripActivityQuantity(newQuantity, tripId, activityId, customerId);
      return { message: result };
    },
  },
};
module.exports = resolvers;
