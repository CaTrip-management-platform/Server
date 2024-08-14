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
      return { message: result.insertedId };
  }

  static async deleteTrip(tripId, customerId) {
    const tripCollection = DB.collection("trips");

    const result = await tripCollection.deleteOne({
      _id: new ObjectId(tripId),
      customerId: new ObjectId(customerId),
    });
    return { message: "Trip deleted" };
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
      return { message: "Success add new activity to your trip" };
  
  }

  static async createPayment(tripId, amount) {
    const tripCollection = DB.collection("trips");
    const trip = await tripCollection.findOne({ _id: new ObjectId(tripId) });
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
    try {
      const transaction = await snap.createTransaction(parameter);
      return {
        success: true,
        redirectUrl: transaction.redirect_url,
        orderId: orderId,
        token: transaction.token,
      };
    } catch (error) {
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
    console.log(result.activities);
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
        $project: {
          destination: 1,
          totalPrice: 1,
          paymentStatus: 1,
          customerId: 1,
          startDate: 1,
          endDate: 1,
          createdAt: 1,
          updatedAt: 1,
          customer: 1,
          activities: {
            $cond: {
              if: { $isArray: "$activities" },
              then: "$activities",
              else: "$$REMOVE"
            }
          }
        }
      },
      {
        $lookup: {
          from: "activities",
          localField: "activities.activityId",
          foreignField: "_id",
          as: "activitiesDetails"
        }
      },
      {
        $addFields: {
          activities: {
            $map: {
              input: "$activities",
              as: "activity",
              in: {
                $mergeObjects: [
                  "$$activity",
                  {
                    Activity: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$activitiesDetails",
                            cond: { $eq: ["$$this._id", "$$activity.activityId"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          activitiesDetails: 0
        }
      }
    ];
    const tripCollection = DB.collection("trips");
    const result = await tripCollection.aggregate(pipeline).toArray();
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
      return { message: "Activity deleted from trip" };
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
  }
}

module.exports = Trip;
