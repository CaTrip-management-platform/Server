const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

const DB = client.db("CaTrip")

module.exports = {
    client,
    DB
}


