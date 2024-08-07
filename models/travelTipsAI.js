const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

const apiKey = "AIzaSyA9g0IJ8_sfOVDiSapMqiIR8DcYV_LfRp8";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function getTravelSupportResponse(message) {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
  
    try {
      const result = await chatSession.sendMessage(message);
      const responseText = result.response.text();
      
      if (!responseText) {
        throw new Error("Empty response from AI");
      }
      
      return responseText;
    } catch (error) {
      console.error("Error during communication with Gemini AI:", error.message);
      return "Error: Unable to get response from AI. Please try again later.";
    }
  }
  
  module.exports = { getTravelSupportResponse }