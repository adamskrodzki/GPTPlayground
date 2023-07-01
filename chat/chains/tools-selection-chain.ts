import { ChatCompletionResponseMessage } from 'openai';
import { OpenAIChat } from '../chat';
import functionsFactory from '../functions-factory';
import { requiredToolsFunctionInstance } from '../functions/required-tools';


async function toolSelectorChain(question : string, systemPrompt : string, debug = false) : Promise<{
  response: string[];
  totalUsed: number;
}> {

  return new Promise<{
    response: string[];
    totalUsed: number;
  }>((resolve, reject) => {
    let isFinished = false;
    const chat = new OpenAIChat();

    const tools = functionsFactory.ListAvailableFunctions();

    // Set system messages for each agent
    // Not really needed in this case, but it's a good practice
    chat.setSystemMessage(
      `As an AI, you are tasked with assisting other AI systems in selecting the most effective tools for a given job or task.
       You will be provided with detailed descriptions of the target task and system prompts for the target AI.
      Your response should identify the optimal tools needed for the task by calling the required_tools function
      with a list of the chosen tools. The tools will be provided to you from a pre-determined list.
      Remember, your ultimate goal is to facilitate the optimal performance of the target AI in completing its task by specifying best tools for a job.
      \r\n\r\n
      OTHER AI SYSTEM PROMPT:\r\n 
      ${systemPrompt}\r\n\r\n
      AVAILABLE TOOLS:\r\n
      ${tools}`
    );

    // Set temperature, max tokens, and penalties for both agents
    chat.setTemperature(0);
    chat.setMaxTokens(200);
    chat.setPresencePenalty(1);
    chat.setFrequencyPenalty(1);

    requiredToolsFunctionInstance.beforeExecute = async (response) => {
      resolve({ response: response.tools, totalUsed: chat.getTotalTokens() });
      isFinished = true;
      console.log('Total tokens used:', chat.getTotalTokens());
      return response;
    };

    chat.addSupportedFunction(requiredToolsFunctionInstance);
    chat.setIsFinished(() => {
      return isFinished === true;
    });

    async function aiResponseHandler(response: ChatCompletionResponseMessage): Promise<void> {
      if(response.content && chat.isDebug()){
        console.log('AI:', response.content);
      }
      //console.warn('RAW MESSAGE:', response);
      while(chat.notFinished()){
        await chat.hears("Continue", (nextMessage) => {
          if(nextMessage.content && chat.isDebug()){
            console.log('AI:', nextMessage.content);
          }
        });
      }
    }

    chat.setDebug(debug);
    chat.hears(`Please select tools, most suitable to fullfill following reqest/question/task:${question}`, aiResponseHandler).catch((err) => {
      reject(err); 
    });

  });

}

export default toolSelectorChain;
