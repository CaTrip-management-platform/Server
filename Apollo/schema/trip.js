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
    customer: Customer
}

type Customer {
    username: String
    phoneNumber: String
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

type PaymentResponse {
    success: Boolean!
    redirectUrl: String
    orderId: String
    token: String
}

type PaymentStatusResponse {
    success: Boolean!
    paymentStatus: String
    message: String
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
    updatePaymentStatus(tripId:String!, orderId: String!): PaymentStatusResponse!
    deleteActivityFromTrip(tripId: String!, activityId: String!): Response
    updateTripDate(dateInput: UpdateTripDate!, tripId: String!): Response

}

`;

module.exports = typeDefs;
