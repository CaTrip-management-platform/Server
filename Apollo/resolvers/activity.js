const { GraphQLError } = require("graphql")
const Activity = require("../models/Activity")
const User = require("../models/User")

const resolvers = {
    Query: {
        getAllActivity: async () => {
            try {
                let postResult = await Activity.findAll()
                return postResult
            }
            catch (err) {
                console.log(err)
            }
        },
        searchActivity: async (_, args) => {
            let { searchTerm } = args
            let postResult = Activity.search(searchTerm)
            return postResult
        },
        getActivityById: async (_, args) => {
            let { _id } = args
            let postResult = Activity.findById(_id)
            return postResult
        },
        getActivityBySellerId: async (_, args) => {
            let { sellerId } = args
            let postResult = Activity.findBySellerId(sellerId)
            return postResult
        },
    },
    Mutation: {
        addActivityForSeller: async (_, args, contextValue) => {
            let { title, types, imgurls, description, tags, location } = args
            const payload = await contextValue.authentication()
            if (payload.role == 'admin') {
                let postResult = Activity.addActivityForSeller(title, types, imgurls, description, tags, location, payload.id,)
                // await redis.del('post:all')
                return postResult
            } else; {
                throw GraphQLError("Only sellers can do this")
            }
        },
        updateActivityForseller: async (_, args, contextValue) => {
            let { activityId, title, types, imgurls, description, tags, location } = args
            const payload = await contextValue.authentication()

            let postResult = Activity.updateActivityForseller(activityId, title, types, imgurls, description, tags, location, payload.id)
            return postResult
        },
        deleteActivityForSeller: async (_, args, contextValue) => {
            let { activityId } = args
            const payload = await contextValue.authentication()
            if (payload.role === "admin") {
                let deleteResult = await Activity.deleteActivityForSeller(activityId, payload.id)
                return deleteResult
            } else {
                throw new GraphQLError("You are not authorize")
            }
        },

        reviewActivity: async (_, args, contextValue) => {
            let { activityId, content, rating } = args
            const payload = await contextValue.authentication()
            console.log(payload, "<=====payload")
            let user = await User.findUserById(payload.id)
            console.log(user, "<==========")
            let username = user.username
            let result = await Activity.reviewActivity(activityId, content, rating, username)
            // await redis.del('post:all')
            console.log(result)
            return result
        },


    }

}


module.exports = resolvers