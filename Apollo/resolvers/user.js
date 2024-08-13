const User = require("../models/User");

const resolvers = {
  Query: {
    findUserByUserId: async (_, { id }) => {
      console.log(id);
      const data = await User.findUserById(id);
      return data;
    },
  },
  Mutation: {
    createUser: async (_, args) => {
      const data = await User.create(args);
      return data;
    },
    login: async (_, args) => {
      const result = await User.login(args);
      return result;
    },
  },
};

module.exports = resolvers;
