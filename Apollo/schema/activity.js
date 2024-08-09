const typeDefs = `#graphql
    scalar Date
    type Activity {
        _id: String
        title: String!
        price: Int
        imgUrls: [String]
        reviews: [Review]
        description: String
        userId: String
        tags: [String]
        createdAt: Date
        updatedAt: Date
        customers:[String]
        location:String
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
        addActivityForSeller(title:String, price: Int, imgurls:[String], description:String, tags: [String], location:String): Activity
        updateActivityForseller(activityId:String, title:String, price: String, imgurls:[String], description:String, tags: [String], location:String):Activity
        deleteActivityForSeller(activityId: String!): String
        reviewActivity(activityId:String, content:String, rating:Int):Activity

    }
`;
module.exports = typeDefs;
