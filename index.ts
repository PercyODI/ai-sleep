import "dotenv/config";
import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain, SequentialChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";

import * as _ from "lodash"

const main = async () => {
  const model = new OpenAI({
    openAIApiKey: process.env["OPENAPI_KEY"]!,
    modelName: "gpt-3.5-turbo-1106"
  });
  
  const memory = new BufferMemory();

  const prompt = new PromptTemplate({
    template: `
    {systemInstruction}

    Theme of this Sleep Cast: {theme}

    Give a short synopsis of the Sleep Cast you are about to write.
  `.trim(),
    inputVariables: ["theme", "systemInstruction"],
  });

  const synopsisChain = new LLMChain({
    llm: model,
    prompt,
    memory,
    outputKey: "synopsis",
  });

  const herosJourneyPrompt = (chaptNum: number, step: string) => {
    // let storySoFar = "";
    // if (chaptNum > 0) {
    //   storySoFar = `Story So Far: ${_.range(chaptNum - 1)
    //     .map((n) => `{chapter-${n}}`)
    //     .join("\n")}`;
    // }

    // const inputStorySoFarInputVariables =
    //   chaptNum > 0
    //     ? _.range(chaptNum - 1).map((n) => `chapter-${n}`)
    //     : [];

    return new PromptTemplate({
      template: `
      {systemInstruction}

      It is time to write chapter ${chaptNum}.

      Story Synopsis: {synopsis}

      Remember that we are using the hero's journey. This chapter is responsible for ${step}

      Write chapter ${chaptNum} in the Sleep Cast.
  `.trim(),
      inputVariables: ["synopsis", "systemInstruction"],
    });
  };

  const storySteps = [
    `The Call to Adventure. The hero begins in a situation of normality from which some information is received that acts as a call to head off into the unknown. Often when the call is given, the future hero first refuses to heed it. This may be from a sense of duty or obligation, fear, insecurity, a sense of inadequacy, or any of a range of reasons that work to hold the person in his current circumstances. `,
    `Meeting with the Mentor and The Crossing of the First Threshold. Once the hero has committed to the quest, consciously or unconsciously, their guide and magical helper appears or becomes known. More often than not, this supernatural mentor will present the hero with one or more talismans or artifacts that will aid them later in their quest. This is the point where the hero actually crosses into the field of adventure, leaving the known limits of their world and venturing into an unknown and dangerous realm where the rules and limits are unknown.`,
    `The Road of Trials and Apotheosis. The road of trials is a series of tests that the hero must undergo to begin the transformation. Often the hero fails one or more of these tests, which often occur in threes. Eventually, the hero will overcome these trials and move on to the next step. This is the point of realization in which a greater understanding is achieved. Armed with this new knowledge and perception, the hero is resolved and ready for the more difficult part of the adventure.`,
    `The Ultimate Boon. The ultimate boon is the achievement of the goal of the quest. It is what the hero went on the journey to get. All the previous steps serve to prepare and purify the hero for this step since in many myths the boon is something transcendent like the elixir of life itself, or a plant that supplies immortality, or the holy grail. `,
    `Refusal of the Return and The Crossing of the Return Threshold. Having found bliss and enlightenment in the other world, the hero may not want to return to the ordinary world to bestow the boon onto their fellow beings. The returning hero, to complete his adventure, must survive the impact of the world. The goal of the return is to retain the wisdom gained on the quest and to integrate it into society. This is the final chapter.`,
  ];

  const sleepCastChain = new SequentialChain({
    chains: [
      synopsisChain,
      ..._.range(5).map(
        (n) =>
          new LLMChain({
            llm: model,
            prompt: herosJourneyPrompt(n, storySteps[n]),
            outputKey: `chapter-${n}`,
          })
      )
    ],
    inputVariables: ["theme", "systemInstruction"],
    verbose: true,
    returnAll: true
  });

  const sleepCastExecutionResult = await sleepCastChain.call({
    theme: "Fantasy Tavern Owner",
    systemInstruction: `
    Write a "Sleep Cast" that can be listened to to help people fall asleep.
    A Sleep Cast is like a podcast, where it is an audio experience that people listen to to fall asleep. 
    The Sleep Cast should follow these rules:
    - It is a long, winding story. 
    - It is told in the 2nd person, like it is happening to the person listening.
    - It gently rhymes, with a comforting meter or feet.
    - Imagine it is being read by someone with a deep, slow, comforting voice.
    - It uses very simple vocabulary. It should be at a kindergarten level people don't have to think too hard while falling asleep.
    - It describes things in more detail than normal. For example: "There was confetti all over the road. There was red, green, blue, purple, yellow, and white confetti."
    - It uses excessive descriptions. For example: "The candle was lit, a bright yellow flickering flame was burning gently and fully in it's vanilla, off-white wax.
    - It should be appropriate for people with afantasia. Don't ask someone to imagine or visualize something, because they can't.
    
    The Sleep Cast will consist of 5 chapters. I will request each chapter individually. 

    Each Chapter should start with "Chapter <chapter number>: <chapter title>".
    `
  });

  const fullStory = _.chain(sleepCastExecutionResult)
    .filter((_a, r: string) => r.startsWith("chapter-"))
    .sort((a, b) => Number(a.slice(-1)) - Number(b.slice(-1)))
    .join("\n")
    .value()

  console.log({ sleepCastExecutionResult });

  console.log(fullStory)

  // Start Text to Voice

};

Promise.all([main()]);
