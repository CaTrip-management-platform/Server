const { ObjectId } = require("mongodb");
const { DB } = require("../config/db");
const { GraphQLError } = require("graphql");
const snap = require(`../config/midtransConfig`);

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
    const { tripId, activityId, quantity, activityDate } = activityInput;
    const tripCollection = DB.collection("trips");
    const activityCollection = DB.collection("activities");

    const activity = await activityCollection.findOne({
      _id: new ObjectId(activityId),
    });

    const result = await tripCollection.updateOne(
      {
        _id: new ObjectId(tripId),
        customerId: new ObjectId(customerId),
      },
      {
        $push: {
          activities: {
            activityId: new ObjectId(activityId),
            quantity,
            activityDate: new Date(activityDate),
          },
        },
        $inc: {
          totalPrice: activity.price * quantity,
        },
      }
    );

    if (result.modifiedCount) {
      return { message: "Success add new activity to your trip" };
    } else {
      throw new GraphQLError("Trip not found");
    }
  }

  static async createPayment(tripId, amount) {
    const tripCollection = DB.collection("trips");
    const trip = await tripCollection.findOne({ _id: new ObjectId(tripId) });
    if (!trip) {
      throw new GraphQLError("Trip not found");
    }

    let parameter = {
      transaction_details: {
        order_id: tripId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
    };
    try {
      const transaction = await snap.createTransaction(parameter);
      console.log(transaction.redirect_url);
      return {
        success: true,
        redirectUrl: transaction.redirect_url,
        orderId: orderId,
        token: transaction.token,
      };
    } catch (error) {
      console.error("Error creating Midtrans transaction:", error);
      throw new GraphQLError("Error creating payment");
    }
  }

  static async getTrips(customerId) {
    const pipeline = [
      {
        $match: {
          customerId: new ObjectId(customerId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      {
        $project: {
          customer: {
            password: 0,
            role: 0,
            _id: 0,
            email: 0,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const tripCollection = DB.collection("trips");
    const result = await tripCollection.aggregate(pipeline).toArray();
    // console.log(result[0].activities);
    return result;
  }

  static async getTripById(tripId) {
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(tripId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      {
        $project: {
          customer: {
            password: 0,
            role: 0,
            _id: 0,
            email: 0,
          },
        },
      },
    ];
    const tripCollection = DB.collection("trips");
    return tripCollection.aggregate(pipeline).toArray();
  }

  static async deleteActivityFromTrip(tripId, activityId, customerId) {
    const tripCollection = DB.collection("trips");
    const activityCollection = DB.collection("activities");

    const activity = await activityCollection.findOne({
      _id: new ObjectId(activityId),
    });

    const trip = await tripCollection.findOne(
      {
        _id: new ObjectId(tripId),
        customerId: new ObjectId(customerId),
        "activities.activityId": new ObjectId(activityId),
      },
      {
        projection: { "activities.$": 1 },
      }
    );

    if (!trip || trip.activities.length === 0) {
      throw new GraphQLError("Activity not found in the trip");
    }

    const quantity = trip.activities[0].quantity;
    const price = activity.price;

    const result = await tripCollection.updateOne(
      {
        _id: new ObjectId(tripId),
        customerId: new ObjectId(customerId),
      },
      {
        $pull: {
          activities: {
            activityId: new ObjectId(activityId),
          },
        },
        $inc: {
          totalPrice: -(price * quantity),
        },
      }
    );

    if (result.modifiedCount > 0) {
      return { message: "Activity deleted from trip" };
    } else {
      throw new GraphQLError("Failed to delete activity from trip");
    }
  }
  static async updateTripDate(dateInput, tripId, customerId) {
    const { startDate, endDate } = dateInput;
    if (!startDate || !endDate) {
      throw new GraphQLError("Date must be filled");
    }
    const tripCollection = DB.collection("trips");
    const filter = {
      _id: new ObjectId(tripId),
      customerId: new ObjectId(customerId),
    };
    const updateDoc = {
      $set: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    };
    const result = await tripCollection.updateOne(filter, updateDoc);
    if (!result.acknowledged) {
      throw new GraphQLError("Failed to update trip date");
    }
    return "Trip date successfully updated";
  }
}

module.exports = Trip;
