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

  static async addActivityTrip(activityInput, customerId) {
    const { tripId, activityId, quantity, type, activityDate } = activityInput;
    const tripCollection = DB.collection("trips");

    const result = await tripCollection.updateOne(
      {
        _id: new ObjectId(tripId),
        customerId: new ObjectId(customerId),
      },
      {
        $push: {
          activities: {
            activityId: new ObjectId(activityId),
            type,
            quantity,
            activityDate: new Date(activityDate),
          },
        },
      }
    );

    if (result.modifiedCount) {
      return { message: "Success add new activity to your trip" };
    } else {
      throw new GraphQLError("Trip not found");
    }
  }
}

module.exports = Trip;
