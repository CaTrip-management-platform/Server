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
            price: activity.price * quantity,
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
    const orderId = `${tripId} ${(new Date).toISOString()}`

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
    };
    console.log(parameter,"<==parameter")
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
      { $unwind: "$activities" },
      {
        $lookup: {
          from: "activities",
          localField: "activities.activityId",
          foreignField: "_id",
          as: "activities.Activity"
        }
      },

      { $unwind: "$activities.Activity" },

      {
        $group: {
          _id: "$_id",
          destination: { $first: "$destination" },
          activities: { $push: "$activities" },
          totalPrice: { $first: "$totalPrice" },
          paymentStatus: { $first: "$paymentStatus" },
          customerId: { $first: "$customerId" },
          startDate: { $first: "$startDate" },
          endDate: { $first: "$endDate" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          customer: { $first: "$customer" }
        }
      }
    ];
    const tripCollection = DB.collection("trips");
    const result = await tripCollection.aggregate(pipeline).toArray();
    console.log(result[0].activities)
    return result
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




  static async updateTripActivityQuantity(newQuantity, tripId, activityId, customerId) {
    const tripCollection = DB.collection("trips");
    const filter = {
      _id: new ObjectId(tripId),
      customerId: new ObjectId(customerId),
    };

    // const update = {
    //   $set: {
    //     "activities.$.quantity": newQuantity
    //   }
    // };

    const options = {
      returnDocument: 'after'
    };

    try {
      const found = await tripCollection.findOne(filter);

      //getquantity
      const item = found.activities.find(item => item.activityId.equals(new ObjectId(activityId)));
      const beforeQuantity = item.quantity
      const beforePrice = item.price


      let after = found.activities.map(item => {
        if (item.activityId.equals(new ObjectId(activityId))) {
          return { ...item, quantity: newQuantity, price: beforePrice / beforeQuantity * newQuantity };
        }
        return item;
      })

      const newTotalPrice = after.reduce((acc, item) => {
        return acc + item.price;
      }, 0);


      // console.log("beforeQuantity: ", beforeQuantity)
      // console.log("afterQuantity: ", newQuantity)
      // console.log("after: ", after)
      // console.log("newTotalPrice: ", newTotalPrice)



      const result = await tripCollection.findOneAndUpdate(filter, {
        $set: {
          activities: after,
          totalPrice: newTotalPrice
        }
      }, options)

      return "Activity quantity updated successfully";
    } catch (error) {
      console.error("Error updating activity quantity:", error);
      throw new Error("Failed to update activity quantity");
    }
  }
  static async calculateNewTotalPrice(tripId, tripCollection) {
    try {
      const result = await tripCollection.findOne({ _id: new ObjectId(tripId) })
      // console.log(result, "<==============calculateNewTotalPrice")
    } catch (error) {
      throw new GraphQLError("Error calculating new price")
    }
  }
}

module.exports = Trip;
