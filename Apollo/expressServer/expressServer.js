require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://catrip:05082024@catrip.rkklqtu.mongodb.net/?retryWrites=true&w=majority&appName=CaTrip";
const client = new MongoClient(uri);
const DB = client.db("CaTrip");

const app = express();
const port = 3001;


app.use(express.json());

app.get('/', async (req, res) => {
            res.status(200).json({ msg: "masuk" });
});


app.post('/', async (req, res) => {
    const { order_id } = req.body;


    const tripCollection = DB.collection("trips");

    try {
        const result = await tripCollection.updateOne(
            { _id: new ObjectId(order_id.split(" ")[0]) },
            {
                $set: {
                    paymentStatus: "Paid",
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 1) {
            console.log(`Updated payment status for trip ${order_id} to paid`);
            res.status(200).json({ success: true });
        } else {
            console.log(`Trip not found or status not updated for ${order_id}`);
            res.status(404).json({ success: false, message: 'Trip not found or status not updated' });
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ success: false, message: 'Error updating payment status' });
    }
});


async function startServer() {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer()