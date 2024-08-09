require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const { DB } = require('../config/db');

const app = express();
const port = 3001;


app.use(express.json());


app.post('/', async (req, res) => {
    const { order_id, transaction_status } = req.body;


    const tripCollection = DB.collection("trips");

    try {
        const result = await tripCollection.updateOne(
            { _id: new ObjectId(order_id) },
            {
                $set: {
                    paymentStatus: "paid",
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 1) {
            console.log(`Updated payment status for trip ${order_id} to ${transaction_status}`);
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
    await connectToDatabase();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

startServer()