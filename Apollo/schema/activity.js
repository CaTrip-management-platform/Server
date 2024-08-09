const typeDefs = `#graphql
    scalar Date
    type Activity {
        _id: String
        title: String!
        types: [Ticket]
        imgUrls: [String]
        reviews: [Review]
        description: String
        sellerId: String
        tags: [String]
        createdAt: Date
        updatedAt: Date
        customers:[String]
        location:String
    }

    type Ticket {
        price: Int
        name: String
    }

    input TicketInput {
        price: Int
        name: String
    }

    type Review {
        content: String
        username: String!
        rating: Int!
        createdAt: Date
        updatedAt: Date
    }

    type Query {
        getAllActivity: [Activity]
        getActivityById(_id:String):Activity
        searchActivity(searchTerm:String):[Activity]
        getActivityBySellerId(sellerId:String):[Activity]
    }


    
    type Mutation {
        addActivityForSeller(title:String, types:[TicketInput], imgurls:[String], description:String, tags: [String], location:String): Activity
        updateActivityForseller(activityId:String, title:String, types:[TicketInput], imgurls:[String], description:String, tags: [String], location:String):Activity
        deleteActivityForSeller(activityId: String!): String
        reviewActivity(activityId:String, content:String, rating:Int):Activity

    }
`
module.exports = typeDefs