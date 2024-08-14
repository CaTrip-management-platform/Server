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
    await db.collection('activities').deleteMany({});

    const remainingActivities = await db.collection('activities').find({}).toArray();
    console.log('Remaining activities after deletion:', remainingActivities);

    await client.close();
    await server?.stop();
  });

  let testActivityId;
  const testSellerId = '66b1ab1a1f8a522270a599d2';

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
    testActivityId = response.body.data.addActivityForSeller._id; 
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
  
    const variables = { id: testActivityId };
  
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

  it('should update an activity for a seller', async () => {
    const mutation = `
      mutation UpdateActivityForSeller($activityId: String!, $title: String, $price: Int, $imgUrls: [String], $description: String, $tags: [String], $location: String, $coords: CoordinateInput) {
        updateActivityForseller(activityId: $activityId, title: $title, price: $price, imgUrls: $imgUrls, description: $description, tags: $tags, location: $location, coords: $coords) {
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
      activityId: testActivityId,
      title: 'Updated Test Activity',
      price: 150,
      imgUrls: ['http://example.com/new-image.jpg'],
      description: 'This is an updated test activity.',
      tags: ['updated', 'activity'],
      location: 'Updated Location',
      coords: { latitude: '11.0', longitude: '21.0' },
    };
  
    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });
  
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateActivityForseller).toHaveProperty('_id', testActivityId);
    expect(response.body.data.updateActivityForseller).toHaveProperty('title', 'Updated Test Activity');
    expect(response.body.data.updateActivityForseller).toHaveProperty('price', 150);
    expect(response.body.data.updateActivityForseller).toHaveProperty('coords', { latitude: '11.0', longitude: '21.0' });
  });

  it('should add a review to an activity', async () => {
    const mutation = `
      mutation ReviewActivity($activityId: String!, $content: String!, $rating: Int!) {
        reviewActivity(activityId: $activityId, content: $content, rating: $rating) {
          _id
          reviews {
            username
            content
            rating
          }
        }
      }
    `;
  
    const variables = {
      activityId: testActivityId,
      content: 'Great activity!',
      rating: 5,
    };
  
    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });
  
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.reviewActivity).toHaveProperty('_id', testActivityId);
    expect(response.body.data.reviewActivity.reviews[0]).toHaveProperty('content', 'Great activity!');
    expect(response.body.data.reviewActivity.reviews[0]).toHaveProperty('rating', 5);
  });

  it('should delete an activity for a seller', async () => {
    const mutation = `
      mutation DeleteActivityForSeller($activityId: String!) {
        deleteActivityForSeller(activityId: $activityId)
      }
    `;
  
    const variables = { activityId: testActivityId };
  
    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });
  
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteActivityForSeller).toBe('Activity deleted');
  });

 
});
