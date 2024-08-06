const { ObjectId } = require("mongodb");
const { DB } = require("../config/db");
const { GraphQLError } = require("graphql");

class Trip {
  static async createTrip(tripInput, customerId) {
    const { destination, startDate, endDate } = tripInput;
    if (!destination) {
      throw new GraphQLError("Destination is required");
    }

    if (!startDate) {
      throw new GraphQLError("Start date is required");
    }
    if (!endDate) {
      throw new GraphQLError("End date is required");
    }
    const tripCollection = DB.collection("trips");

    const result = await tripCollection.insertOne({
      destination,
      activities: [],
      totalPrice: 0,
      paymentStatus: "Pending",
      customerId: new ObjectId(customerId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (result.acknowledged) {
      return { message: "success add a new trip" };
    } else {
      throw new GraphQLError("failed to add trip");
    }
  }

  static async deleteTrip(tripId, customerId) {
    const tripCollection = DB.collection("trips");

    const result = await tripCollection.deleteOne({
      _id: new ObjectId(tripId),
      customerId: new ObjectId(customerId),
    });

    if (result.deletedCount === 0) {
      throw new GraphQLError("failed delete the trip");
    } else {
      return { message: "Trip deleted" };
    }
  }
}

module.exports = Trip;
