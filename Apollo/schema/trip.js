const typeDefs = `#graphql
scalar Date
type Trip {
    _id: String
    destination: String
    activities: [ActivityTrip]
    totalPrice: Int
    paymentStatus: String
    customerId: String
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
    customer: Customer
}

type Customer {
    username: String
    phoneNumber: String
}

type ActivityTrip {
    activityId: String
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
    quantity: Int!
    activityDate: Date!
}

type PaymentResponse {
    success: Boolean!
    redirectUrl: String
    orderId: String
    token: String
}

input UpdateTripDate {
    startDate: Date!
    endDate: Date!
}

type Query {
    getTripsByCustomerId: [Trip]
    getTripById(tripId: String!): Trip

}

type Mutation {
    addTrip(tripInput: NewTrip): Response
    deleteTrip(tripId: String!): Response
    addActivityToTrip(activityInput: NewActivityTrip): Response
    createPayment(tripId: String!, amount: Float!): PaymentResponse!
    deleteActivityFromTrip(tripId: String!, activityId: String!): Response
    updateTripDate(dateInput: UpdateTripDate!, tripId: String!): Response
}

`;

module.exports = typeDefs;
