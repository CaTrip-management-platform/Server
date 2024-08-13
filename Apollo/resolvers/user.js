const User = require("../models/User");

const resolvers = {
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
