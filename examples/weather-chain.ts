import { ChatCompletionResponseMessage } from 'openai';
import { OpenAIChat } from '../chat/chat';
import { AIThoughtsFunction } from '../chat/functions/ai-thoughts';
import { WeatherFunction } from '../chat/functions/get-wether';
import { stopFunctionInstance } from '../chat/functions/stop-function';
const weatherChain = new OpenAIChat();

// Set system messages for each agent
// Not really needed in this case, but it's a good practice
weatherChain.setSystemMessage(
  'As an intelligent assistant, your task is to use the functions available to you to fulfil any request the user might have. \
  If you lack the necessary functions, your response should be based on the most accurate knowledge in your dataset. \
  In case where you don\'t possess any relevant knowledge on the subject, respond with "I do not know" and remain idle. \
  Prior to performing the requested action, please describe your thought process step-by-step by calling the \'ai_thoughts\' function. \
  This includes identifying the user\'s request, understanding what functions or knowledge are necessary to fulfil it, and explaining \
  how you plan to utilize these resources to generate an appropriate response. Always remember to inform the user about your thought \
  process before you execute any action. Transparency in what you do enhances user experience and trust. This way, the user understands \
  how their requests are handled.',
);


// Set temperature, max tokens, and penalties for both agents
weatherChain.setTemperature(0);
weatherChain.setMaxTokens(200);
weatherChain.setPresencePenalty(1);
weatherChain.setFrequencyPenalty(1);

const weatherFunctionInstance = new WeatherFunction(async (location, unit)=>{
  //TODO: implement real weather function
    return {
      temperature: 20,
      description: 'Sunny',
    }
})

const aiThoughtsFunctionInstance = new AIThoughtsFunction();

weatherChain.addSupportedFunction(weatherFunctionInstance)
weatherChain.addSupportedFunction(aiThoughtsFunctionInstance)
weatherChain.addSupportedFunction(stopFunctionInstance);

weatherChain.setIsFinished((response) => {
  return !!response.function_call && response.function_call.name === 'stop_function';
});


async function aiResponseHandler(response: ChatCompletionResponseMessage): Promise<void> {
  if(response.content){
    console.log('AI:', response.content);
  }
  //console.warn('RAW MESSAGE:', response);
  while(weatherChain.notFinished()){
    await weatherChain.hears("", (nextMessage) => {
      if(nextMessage.content){
        console.log('AI:', nextMessage.content);
      }
    });
  }
  const total = weatherChain.getTotalTokens();
  console.log('Total tokens used:', total);
}
weatherChain.setDebug(true);
weatherChain.hears('What is a weather in new york?', aiResponseHandler);
