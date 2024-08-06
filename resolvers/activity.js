const { GraphQLError } = require("graphql")
const Activity = require("../models/Activity")

const resolvers = {
    Query: {
        getPosts: async () => {
            try {
                const postCache = await redis.get('post:all')
                if (postCache) {
                    console.log("postcache")
                    return JSON.parse(postCache)
                }
                else {
                    console.log("post from mongoDB")
                    let postResult = await Post.findAll()
                    await redis.set('post:all', JSON.stringify(postResult))
                    return postResult
                }
            }
            catch (err) {
                console.log(err)
            }
        },
        // getPostById: async (_, args) => {
        //     let { _id } = args
        //     let postResult = Post.findById(_id)
        //     return postResult
        // }
    },
    Mutation: {
        addActivityForSeller: async (_, args, contextValue) => {
            let { title, types, imgurls, description, tags } = args
            const payload = await contextValue.authentication()
            if (payload.role == 'seller') {
                let postResult = Activity.addActivityForSeller(title, types, imgurls, description, tags, payload._id)
                // await redis.del('post:all')
                return postResult
            } else; {
                throw GraphQLError("Only sellers can do this")
            }

        },
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