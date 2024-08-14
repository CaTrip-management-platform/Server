require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const request = require('supertest');
const uri = 'mongodb+srv://dddtydrmwn:Didatama123.@cluster0.p2kh6c1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

describe('User', () => {
    let client;
    let db;
    let server;
    let url;
})

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




it('should findall trips', async () => {
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


it('should find one trips', async () => {
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


it('should find one trips', async () => {
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

it('should add one trips', async () => {
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
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toHaveProperty('addTrip');
});
it('should add one trips', async () => {
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
        console.log(response.body.errors)
    expect(response.body.errors[0]).toHaveProperty("messsage");
});