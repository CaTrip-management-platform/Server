const { ObjectId } = require("mongodb");
const { DB } = require("../config/db");

const seeders = async () => {
  // const datas = require("../db.json");
  const postCollection = DB.collection("activities");

  console.log(postCollection);
  // console.log(datas);
  // for (let data of datas) {
  //   data = {
  //     ...data,
  //     sellerId: new ObjectId(data.sellerId),
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };

  //   await postCollection.insertOne(data);
  // }
};

seeders();
