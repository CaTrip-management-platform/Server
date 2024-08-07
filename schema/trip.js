const typeDefs = `#graphql
scalar Date
type Trip {
    _id: String
    destination: String
    activities: [Activity]
    totalPrice: Int
    paymentStatus: String
    customerId: String
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
}
type Activity {
    activityId: String
    type: String
    quantity: Int
    activityDate: Date
}

input NewTrip {
    destination: String!
    startDate: Date!
    endDate: Date!
}

type Response {
    message: String!
}

input NewActivityTrip {
    tripId: String!
    activityId: String!
    type: String!
    quantity: Int!
    activityDate: Date!
}

type Mutation {
    addTrip(tripInput: NewTrip): Response
    deleteTrip(tripId: String!): Response
    addActivityToTrip(activityInput: NewActivityTrip): Response
    deleteActivityFromTrip(tripId: String!, activityId: String!): Response
}

`;

module.exports = typeDefs;
