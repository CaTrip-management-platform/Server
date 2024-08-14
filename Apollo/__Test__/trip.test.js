require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const request = require('supertest');
const Activity = require("../models/Activity");
const uri = 'mongodb+srv://rafiframa:mkfgTcI40kIlHUlb@cluster0.tdm7enh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

describe('Trip', () => {
    let client;
    let db;
    let server;
    let url;

    beforeAll(async () => {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('CaTripTest');

        const apolloServer = new ApolloServer({
            typeDefs: require('../schema/trip'),
            resolvers: require('../resolvers/trip')
        });

        const { url: serverUrl } = await startStandaloneServer(apolloServer, {
            listen: { port: 0 },
            context: async ({ req, res }) => {
                return {
                    authentication: async () => {
                        const payload = { id: "66b1ab1a1f8a522270a599d2", role: "admin" }
                        return payload;
                    },
                }
            }
        });

        server = apolloServer;
        url = serverUrl;
    });

    afterAll(async () => {
        // await db.collection('users2').deleteMany({});
        await client.close();
        await server?.stop();
    });




    it('should getTripsByCustomerId', async () => {
        const query = `
      query GetTripsByCustomerId {
        getTripsByCustomerId {
        totalPrice
        }
    }
    `;

        const response = await request(url)
            .post('/')
            .send({ query: query });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data).toHaveProperty('getTripsByCustomerId');
    });


    it('should getTripById', async () => {
        const query = `
      query GetTripsByCustomerId($tripId: String!) {
  getTripById(tripId: $tripId) {
    totalPrice
  }
}
`;
        const variables = {
            tripId: "66b990c42a1d478f78d13793"
        };

        const response = await request(url)
            .post('/')
            .send({ query: query, variables });
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data).toHaveProperty('getTripById');
    });


    let tripId = ""
    it('should addTrip', async () => {
        const mutation = `
      mutation Mutation($tripInput: NewTrip) {
  addTrip(tripInput: $tripInput) {
    message
  }
}
`;
        const variables = {
            tripInput: {
                destination: "Mars",
                endDate: "01-01-2051",
                startDate: "01-01-2050",
            }
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        tripId = response.body.data.addTrip.message
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data).toHaveProperty('addTrip');
    });


    it('should addTrip', async () => {
        const mutation = `
      mutation Mutation($tripInput: NewTrip) {
  addTrip(tripInput: $tripInput) {
    message
  }
}
`;
        const variables = {
            tripInput: {
                endDate: "01-01-2051",
                startDate: "01-01-2050",
            }
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body).toHaveProperty("errors");
    });


   
    it('addActivityToTrip Success', async () => {
        const mutation = `
        mutation Mutation($activityInput: NewActivityTrip) {
  addActivityToTrip(activityInput: $activityInput) {
    message
  }}`;
        let postResult = await Activity.findAll();
        const activityId = postResult[0]._id.toString();
        const variables = {
            activityInput: {
                activityDate: "01-01-2030",
                activityId,
                quantity: 1,
                tripId
            }
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('addActivityToTrip');
    });



    it('updateTripActivityQuantity Success', async () => {
        const mutation = `
mutation Mutation($activityId: String!, $tripId: String!, $newQuantity: Int) {
  updateTripActivityQuantity(activityId: $activityId, tripId: $tripId, newQuantity: $newQuantity) {
    message
  }}`;
        let postResult = await Activity.findAll();
        const activityId = postResult[0]._id.toString();
        const variables = {
                activityId,
                newQuantity: 2,
                tripId
            
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('updateTripActivityQuantity');
    });






    it('updateTripDate Success', async () => {
        const mutation = `
mutation Mutation($tripId: String!, $dateInput: UpdateTripDate!) {
  updateTripDate(tripId: $tripId, dateInput: $dateInput) {
    message
  }}`;
        let postResult = await Activity.findAll();
        const activityId = postResult[0]._id.toString();
        const variables = {
            tripId,
            dateInput: {
              endDate: "02-02-2030",
              startDate: "02-02-2031"
            }
            
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('updateTripDate');
    });


    it('deleteActivityFromTrip Success', async () => {
        const mutation = `
mutation Mutation($tripId: String!, $activityId: String!) {
  deleteActivityFromTrip(tripId: $tripId, activityId: $activityId) {
    message
  }}`;
        let postResult = await Activity.findAll();
        const activityId = postResult[0]._id.toString();
        const variables = {
            tripId,
            activityId
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('deleteActivityFromTrip');
    });


    it('createPayment Success', async () => {
        const mutation = `
mutation Mutation($tripId: String!, $amount: Float!) {
  createPayment(tripId: $tripId, amount: $amount) {
    orderId
    redirectUrl
    success
    token}}`;
        const variables = {
                amount: 303030,
                tripId
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('createPayment');
    });



    it('should deleteOne trips', async () => {
        const mutation = `
        mutation Mutation($tripId: String!) {
        deleteTrip(tripId: $tripId) {
        message
            }
        }`;
        const variables = {
            tripId
        };
        const response = await request(url)
            .post('/')
            .send({ query: mutation, variables });
        expect(response.body.data).toHaveProperty('deleteTrip');
    });

})