const { getTravelSupportResponse } = require("../models/travelTipsAI");



const resolvers = {
  Query: {
    getTravelSupport: async (_, { message }) => {
      try {
        const response = await getTravelSupportResponse(message);
        return { message: response };
      } catch (error) {
        console.error("Error in resolver getTravelSupport:", error.message);
        return { message: "Error: Unable to get response from AI. Please try again later." };
      }
    },
  },
};

module.exports = resolvers;

  