const { GraphQLError } = require("graphql")
const { DB } = require(`../config/db`)
const { ObjectId } = require("mongodb")

class Activity {
    static async addActivityForSeller(title, types, imgurls, description, tags, sellerId) {
        const postCollection = DB.collection("activities")
        let reviews = []
        let createdAt = new Date()
        let updatedAt = new Date()
        sellerId = new ObjectId(sellerId)

        let result = await postCollection.insertOne({ title, types, imgurls, description, tags, sellerId, createdAt, updatedAt, reviews })
        return await postCollection.findOne({ _id: result.insertedId });
    }

    static async findAll() {
        let pipeline = [
            {
                $sort:
                {
                    createdAt: -1,
                },
            }, {
                $lookup:
                {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "Author",
                },
            }, {
                $unwind: { path: "$Author", },
            }
        ]
        const postCollection = DB.collection("posts")
        let result = await postCollection.aggregate(pipeline).toArray()
        console.log(result)
        return result
    }

    static async findById(_id) {
        const postCollection = DB.collection("posts")

        let pipeline = [
            {
                $match:
                {
                    _id: new ObjectId(_id),
                },
            }, {
                $lookup:
                {
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "Author",
                },
            }, {
                $unwind: { path: "$Author", },
            }, {
                $limit: 1
            },
        ]
        let result = await postCollection.aggregate(pipeline).toArray()
        console.log(result[0])
        return result[0]
    }

    static async commentPost(_id, content, username) {
        const postCollection = DB.collection("posts")
        let comment = {
            content,
            username,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const result = await postCollection.updateOne(
            { _id: new ObjectId(_id) },
            {
                $push: { comments: comment },
            }
        );
        return comment
    }

    static async likePost(_id, username) {
        const postCollection = DB.collection("posts")
        let like = {
            username,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const post = await postCollection.find({ _id: new ObjectId(_id) }).toArray()
        let foundDuplicate = post[0].likes.find(like => like.username == username)
        if (foundDuplicate) {
            const result = await postCollection.updateOne(
                { _id: new ObjectId(_id) },
                {
                    $pull: { likes: { username: username } }
                }
            );
            return like
           
        } else {
            console.log("no duplicate like")
            const result = await postCollection.updateOne(
                { _id: new ObjectId(_id) },
                {
                    $push: { likes: like },
                }
            );
            return like

        }

    }
}

module.exports = Activity