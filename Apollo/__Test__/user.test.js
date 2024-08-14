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

  beforeAll(async () => {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('CaTrip');

    const apolloServer = new ApolloServer({
      typeDefs: require('../schema/user'),
      resolvers: require('../resolvers/user'),
    });

    const { url: serverUrl } = await startStandaloneServer(apolloServer, {
      listen: { port: 0 },
    });

    server = apolloServer;
    url = serverUrl;
  });

  afterAll(async () => {
    await db.collection('users2').deleteMany({});
    await client.close();
    await server?.stop();
  });

  it('should create a new user', async () => {
    const mutation = `
      mutation CreateUser($phoneNumber: String, $username: String, $email: String, $password: String) {
        createUser(phoneNumber: $phoneNumber, username: $username, email: $email, password: $password) {
          _id
          username
          email
        }
      }
    `;

    const uniqueUsername = `e2euser${Date.now()}`;
    const variables = {
      phoneNumber: '1234567890',
      username: uniqueUsername,
      email: `${uniqueUsername}@example.com`,
      password: 'password123',
    };

    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createUser).toHaveProperty('_id');
    expect(response.body.data.createUser).toHaveProperty('username');
    expect(response.body.data.createUser).toHaveProperty('email');
  });

  it('should login with the created user', async () => {
    const mutation = `
      mutation Login($username: String, $password: String) {
        login(username: $username, password: $password) {
          access_token
        }
      }
    `;

    const variables = {
      username: 'e2euser',
      password: 'password123',
    };

    const response = await request(url)
      .post('/')
      .send({ query: mutation, variables });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.login).toHaveProperty('access_token');
  });
});
 