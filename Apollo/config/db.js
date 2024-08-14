const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;

// const client = new MongoClient('mongodb+srv://dddtydrmwn:Didatama123.@cluster0.p2kh6c1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const client = new MongoClient(uri);

const DB = client.db("CaTrip");

module.exports = {
  client,
  DB,
};
