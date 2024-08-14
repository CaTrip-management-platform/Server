const User = require("../models/User");

const resolvers = {
  Query: {
    findUserById: async (_, args) => {
      const result = await User.findById(args.id);

      return result;
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
