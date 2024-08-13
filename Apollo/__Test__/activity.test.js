require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const request = require('supertest');
const uri = 'mongodb+srv://dddtydrmwn:Didatama123.@cluster0.p2kh6c1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

describe('Activity', () => {
  let client;
  let db;
  let server;
  let url;

  beforeAll(async () => {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('CaTrip');
    
    const apolloServer = new ApolloServer({
      typeDefs: require('../schema/activity'),  
      resolvers: require('../resolvers/activity'), 
    });

    const { url: serverUrl } = await startStandaloneServer(apolloServer, {
      listen: { port: 0 },
    });

    server = apolloServer;
    url = serverUrl;
  });

  afterAll(async () => {
    await db.collection('activities2').deleteMany({});
    
    const remainingActivities = await db.collection('activities2').find({}).toArray();
    console.log('Remaining activities after deletion:', remainingActivities);

    await client.close();
    await server?.stop();
  });

  let testActivityId;
  let testSellerId = 'seller123'; // Use a valid seller ID

  it('should add a new activity for a seller', async () => {
    const mutation = `
      mutation AddActivityForSeller($title: String!, $price: Int, $imgUrls: [String], $description: String, $tags: [String], $location: String, $coords: CoordinateInput) {
        addActivityForSeller(title: $title, price: $price, imgUrls: $imgUrls, description: $description, tags: $tags, location: $location, coords: $coords) {
          _id
          title
          price
          imgUrls
          description
          tags
          location
          coords {
            latitude
            longitude
          }
        }
      }
    `;

    const variables = {
      title: 'Test Activity',
      price: 100,
      imgUrls: ['http://example.com/image.jpg'],
      description: 'This is a test activity.',
      tags: ['test', 'activity'],
      location: 'Test Location',
      coords: { latitude: '10.0', longitude: '20.0' },
    };

    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addActivityForSeller).toHaveProperty('_id');
    testActivityId = response.body.data.addActivityForSeller._id; // Store the ID for further tests
  });

  it('should get all activities', async () => {
    const query = `
      query {
        getAllActivity {
          _id
          title
          description
        }
      }
    `;

    const response = await request(url)
      .post('/')
      .send({ query });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getAllActivity).toEqual(expect.any(Array));
    expect(response.body.data.getAllActivity.length).toBeGreaterThan(0);
    expect(response.body.data.getAllActivity[0]).toHaveProperty('_id');
    expect(response.body.data.getAllActivity[0]).toHaveProperty('title');
  });

  it('should search activities', async () => {
    const query = `
      query SearchActivity($searchTerm: String!) {
        searchActivity(searchTerm: $searchTerm) {
          _id
          title
          description
        }
      }
    `;

    const variables = { searchTerm: 'Test' };

    const response = await request(url)
      .post('/')
      .send({ query, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.searchActivity).toEqual(expect.any(Array));
    expect(response.body.data.searchActivity.length).toBeGreaterThan(0);
    expect(response.body.data.searchActivity[0]).toHaveProperty('_id');
    expect(response.body.data.searchActivity[0]).toHaveProperty('title');
  });

  it('should get activity by ID', async () => {
    const query = `
      query GetActivityById($id: String!) {
        getActivityById(_id: $id) {
          _id
          title
          description
        }
      }
    `;

    const variables = { _id: testActivityId };

    const response = await request(url)
      .post('/')
      .send({ query, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getActivityById).toHaveProperty('_id', testActivityId);
    expect(response.body.data.getActivityById).toHaveProperty('title', 'Test Activity');
  });

  it('should get activities by seller ID', async () => {
    const query = `
      query GetActivityBySellerId($sellerId: String!) {
        getActivityBySellerId(sellerId: $sellerId) {
          _id
          title
          description
        }
      }
    `;

    const variables = { sellerId: testSellerId };

    const response = await request(url)
      .post('/')
      .send({ query, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getActivityBySellerId).toEqual(expect.any(Array));
    expect(response.body.data.getActivityBySellerId.length).toBeGreaterThan(0);
    expect(response.body.data.getActivityBySellerId[0]).toHaveProperty('_id');
    expect(response.body.data.getActivityBySellerId[0]).toHaveProperty('title');
  });
});
