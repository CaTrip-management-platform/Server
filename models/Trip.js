const { ObjectId } = require("mongodb");
const { DB } = require("../config/db");
const { GraphQLError } = require("graphql");
const snap = require(`../config/midtransConfig`)

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






  static async createPayment(tripId, amount) {
    const tripCollection = DB.collection("trips");
    const trip = await tripCollection.findOne({ _id: new ObjectId(tripId) });
    if (!trip) {
      throw new GraphQLError('Trip not found');
    }
    const orderId = `ORDER-${tripId}-${Date.now()}`;
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      credit_card: {
        secure: true
      }
    }; try {
      const transaction = await snap.createTransaction(parameter);
      console.log(transaction.redirect_url)
      return { success: true, redirectUrl: transaction.redirect_url, orderId: orderId, token: transaction.token };
    } catch (error) {
      console.error('Error creating Midtrans transaction:', error);
      throw new GraphQLError('Error creating payment');
    }

  }

  static async updatePaymentStatus(tripId, orderId) {
    const tripCollection = DB.collection("trips");

    try {
      // const transactionStatusResponse = await snap.transaction.status(orderId);
      // console.log(transactionStatusResponse,"<=====transactionStatusResponse")
      // const transactionStatus = transactionStatusResponse.transaction_status;

      // let paymentStatus;
      // switch (transactionStatus) {
      //   case 'capture':
      //   case 'settlement':
      //     paymentStatus = 'Paid';
      //     break;
      //   case 'pending':
      //     paymentStatus = 'Pending';
      //     break;
      //   case 'deny':
      //   case 'cancel':
      //   case 'expire':
      //   case 'failure':
      //     paymentStatus = 'Failed';
      //     break;
      //   default:
      //     paymentStatus = 'Unknown';
      // }

      const found = await tripCollection.findOne(
        { _id: new ObjectId(tripId) },
       
      );
      if(!found){
        throw new GraphQLError('Trip not found')
      }

      const result = await tripCollection.updateOne(
        { _id: new ObjectId(tripId) },
        {
          $set: {
            paymentStatus: "paid",
            updatedAt: new Date()
          }
        }
      );

      if (result.modifiedCount === 1) {
        return { success: true, paymentStatus:"paid" };
      } else {
        return { success: false, message: 'Trip not found or status not updated' };
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      return { success: false, message: 'Error updating payment status' };
    }
  }


}

module.exports = Trip;
