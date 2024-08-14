const { GraphQLError } = require("graphql");
const { DB } = require(`../config/db`);
const { ObjectId } = require("mongodb");

class Activity {
  static async addActivityForSeller(
    title,
    price,
    imgUrls,
    description,
    tags,
    location,
    coords,
    sellerUserId
  ) {
    const postCollection = DB.collection("activities");
    let reviews = [];
    let createdAt = new Date();
    let updatedAt = new Date();
    let customers = [];
    let userId = new ObjectId(sellerUserId);

    let result = await postCollection.insertOne({
      title,
      price,
      imgUrls,
      description,
      tags,
      userId,
      createdAt,
      updatedAt,
      reviews,
      customers,
      location,
      coords,
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

  static async findByuserId(sellerUserId) {
    const postCollection = DB.collection("activities");
    let pipeline = [
      {
        $match: {
          userId: new ObjectId(sellerUserId),
        },
      },
    ];
    let result = await postCollection.aggregate(pipeline).toArray();
    return result;
  }

  static async updateActivityForseller(
    activityId,
    title,
    price,
    types,
    imgUrls,
    description,
    tags,
    location,
    coords,
    userId
  ) {
    const activityCollection = DB.collection("activities");
    const objectIduserId = new ObjectId(userId);
    const objectActivityId = new ObjectId(activityId);
    console.log(
      activityId,
      title,
      price,
      types,
      imgUrls,
      description,
      tags,
      location,
      objectIduserId
    );

    const found = await activityCollection.findOne({
      _id: objectActivityId,
      userId: objectIduserId,
    });

    if (!found) {
      throw new Error(
        "Activity not found or seller does not have permission to update"
      );
    }

    const result = await activityCollection.findOneAndUpdate(
      { _id: objectActivityId, userId: objectIduserId },
      { $set: { title, types, price, imgUrls, description, tags, location, coords } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Update operation failed");
    }

    return result.value || result;
  }

  static async deleteActivityForSeller(activityId, userId) {
    const postCollection = DB.collection("activities");
    const result = await postCollection.deleteOne({
      _id: new ObjectId(activityId),
      userId: new ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throw new GraphQLError(
        "Activity not found or you are not authorized to delete this activity"
      );
    }

    return "Activity deleted";
  }

  static async reviewActivity(activityId, content, rating, username) {
    const postCollection = DB.collection("activities");
    let review = {
      content,
      username,
      rating,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await postCollection.updateOne(
      { _id: new ObjectId(activityId) },
      {
        $push: { reviews: review },
      }
    );
    const findOne = await postCollection.findOne({
      _id: new ObjectId(activityId),
    });
    console.log(findOne,"<=======================")
    return findOne;
  }
}

module.exports = Activity;
