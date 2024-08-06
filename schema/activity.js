const typeDefs = `#graphql
    scalar Date
    type Activity {
        _id: String
        title: String!
        types: [Ticket]
        imgUrls: [String]
        reviews: [Review]
        description: String
        sellerUserId: String
        tags: [String]
        createdAt: Date
        updatedAt: Date
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
        rating: String!
        createdAt: Date
        updatedAt: Date
    }

    type Query {
        getPosts: [Activity]

    }
    
    type Mutation {
        addActivityForSeller(title:String, types:[TicketInput], imgurls:[String], description:String, tags: [String]): Activity
        
    }
`
// getPostById(_id:String): PostWAuthor


// commentPost(_id:String, content:String): Comment
//         likePost(_id:String): Like

module.exports = typeDefs