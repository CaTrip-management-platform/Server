const { GraphQLError } = require("graphql");
const { DB } = require(`../config/db`);
const { ObjectId } = require("mongodb");

class Activity {
  static async addActivityForSeller(
    title,
    types,
    imgurls,
    description,
    tags,
    location,
    sellerUserId
  ) {
    const postCollection = DB.collection("activities");
    let reviews = [];
    let createdAt = new Date();
    let updatedAt = new Date();
    let customers = [];
    let sellerId = new ObjectId(sellerUserId);

    let result = await postCollection.insertOne({
      title,
      types,
      imgurls,
      description,
      tags,
      sellerId,
      createdAt,
      updatedAt,
      reviews,
      customers,
      location,
    });
    return await postCollection.findOne({ _id: result.insertedId });
  }

  static async findAll() {
    let pipeline = [
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const postCollection = DB.collection("activities");
    let result = await postCollection.aggregate(pipeline).toArray();
    console.log(result);
    return result;
  }

  static async search(searchTerm) {
    const activityCollection = DB.collection("activities");
    let results = await activityCollection
      .find({
        title: {
          $regex: new RegExp(searchTerm, "i"),
        },
      })
      .toArray();
    console.log(results);
    return results;
  }

  static async findById(_id) {
    const postCollection = DB.collection("activities");

    let pipeline = [
      {
        $match: {
          _id: new ObjectId(_id),
        },
      },
      {
        $limit: 1,
      },
    ];
    let result = await postCollection.aggregate(pipeline).toArray();
    return result[0];
  }

  static async findBySellerId(sellerUserId) {
    const postCollection = DB.collection("activities");
    let pipeline = [
      {
        $match: {
          sellerId: new ObjectId(sellerUserId),
        },
      },
    ];
    let result = await postCollection.aggregate(pipeline).toArray();
    return result;
  }

  static async updateActivityForseller(
    activityId,
    title,
    types,
    imgurls,
    description,
    tags,
    location,
    sellerId
  ) {
    const activityCollection = DB.collection("activities");
    const objectIdSellerId = new ObjectId(sellerId);
    const objectActivityId = new ObjectId(activityId);
    console.log(
      activityId,
      title,
      types,
      imgurls,
      description,
      tags,
      location,
      objectIdSellerId
    );

    // First, find the document
    const found = await activityCollection.findOne({
      _id: objectActivityId,
      sellerId: objectIdSellerId,
    });

    // Check if a document was found
    if (!found) {
      console.log("No matching document found");
      throw new Error(
        "Activity not found or seller does not have permission to update"
      );
    }

    console.log("Found document:", found);

    // If a document was found, proceed with the update
    const result = await activityCollection.findOneAndUpdate(
      { _id: objectActivityId, sellerId: objectIdSellerId },
      { $set: { title, types, imgurls, description, tags, location } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Update operation failed");
    }

    // Different MongoDB drivers might return the result differently
    return result.value || result;
  }

  static async deleteActivityForSeller(activityId, sellerId) {
    const postCollection = DB.collection("activities");
    const result = await postCollection.deleteOne({
      _id: new ObjectId(activityId),
      sellerId: new ObjectId(sellerId),
    });
    if (result.deletedCount === 0) {
      throw new GraphQLError(
        "Activity not found or you are not authorized to delete this activity"
      );
    }

    return "Activity deleted";
  }
}

module.exports = Activity;
