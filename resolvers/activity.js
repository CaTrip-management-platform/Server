const { GraphQLError } = require("graphql")
const Activity = require("../models/Activity")

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
            let { title, types, imgurls, description, tags,location } = args
            const payload = await contextValue.authentication()
            if (payload.role == 'seller') {
                let postResult = Activity.addActivityForSeller(title, types, imgurls, description, tags, location, payload._id, )
                // await redis.del('post:all')
                return postResult
            } else; {
                throw GraphQLError("Only sellers can do this")
            }
        },
        updateActivityForseller: async(_,args,contextValue) =>{
            let {activityId, title, types, imgurls, description, tags } = args
            const payload = await contextValue.authentication()
            let postResult = Activity.updateActivityForseller(activityId, title, types, imgurls, description, tags, location, payload._id)
            
        }

        // commentPost: async (_, args, contextValue) => {
        //     let { _id, content } = args
        //     const payload = await contextValue.authentication()
        //     let user = await User.findUserById(payload)
        //     let username = user.username
        //     let result = await Post.commentPost(_id, content, username)
        //     await redis.del('post:all')
        //     return result
        // },
        // likePost: async (_, args, contextValue) => {
        //     let { _id } = args
        //     const payload = await contextValue.authentication()
        //     let user = await User.findUserById(payload)
        //     let username = user.username
        //     let result = await Post.likePost(_id, username)
        //     await redis.del('post:all')
        //     return result
        // }

    }
}

module.exports = resolvers