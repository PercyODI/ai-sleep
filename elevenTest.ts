import "dotenv/config";

const ElevenLabs = require("elevenlabs-node");

const main = async () => {
  const voice = new ElevenLabs({
    apiKey: process.env["ELEVENLABS_API_KEY"]!,
    voiceId: "29vD33N1CtxCmqQRPOHJ",
  });

  const res = await voice.textToSpeech({
    fileName: "test.mp3",
    textInput: `Chapter 1: "The Beginning of the Journey"

    In this chapter, we will meet our main character, Lily, who is a young woman with a dream of owning her own tavern. She sets off on a journey to find the perfect location for her tavern and along the way, she encounters magical creatures and beautiful landscapes.`,
    modelId: "eleven_multilingual_v2",
    stability: 0.5,
    similarityBoost: 0.5,
    speakerBoost: true
  });
  console.log({ res });
};

Promise.all([main()]);
