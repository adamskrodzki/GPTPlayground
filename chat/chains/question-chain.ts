import { ChatCompletionResponseMessage } from 'openai';
import { OpenAIChat } from '../chat';
import { AIThoughtsFunction } from '../functions/ai-thoughts';
import { questionStopFunctionInstance } from '../functions/question-stop-function';
import toolSelectorChain from './tools-selection-chain';
import functionsFactory from '../functions-factory';
import { IChatCompletionFunction } from '../base-function';

function ensureAIThoughtsFunction(
  functions: IChatCompletionFunction[],
  chat: OpenAIChat,
): void {
  if (functions.filter((x) => x.name === 'ai_thoughts').length === 0) {
    const aiThoughtsFunction = new AIThoughtsFunction();
    chat.addSupportedFunction(aiThoughtsFunction);
  }
}

function ensureQuestionStopFunction(
  functions: IChatCompletionFunction[],
  chat: OpenAIChat,
): void {
  if (
    functions.filter((x) => x.name === 'question_stop_function').length === 0
  ) {
    chat.addSupportedFunction(questionStopFunctionInstance);
  }
}

async function questionChain(
  question: string,
  debug = false,
): Promise<{
  response: string;
  totalUsed: number;
}> {
  let isFinished = false;
  const chat = new OpenAIChat();

  // Set system messages for each agent
  // Not really needed in this case, but it's a good practice

  const systemMessage =
    "As an intelligent assistant, your task is to use the functions available to you to answer question user have. \
    If you lack the necessary functions, your response should be based on the most accurate knowledge in your dataset. \
    When you gather all necessary information call question_stop_function. \
    Prior to answering, please describe your thought process step-by-step by calling the 'ai_thoughts' function. \
    This includes identifying the user's request, understanding what functions or knowledge are necessary to fulfil it, and explaining \
    how you plan to utilize these resources to generate an appropriate response. Always remember to inform the user about your thought \
    process before you execute any action. Transparency in what you do enhances user experience and trust. This way, the user understands \
    how their requests are handled.";

  chat.setSystemMessage(systemMessage);

  // Set temperature, max tokens, and penalties for both agents
  chat.setTemperature(0);
  chat.setMaxTokens(200);
  chat.setPresencePenalty(1);
  chat.setFrequencyPenalty(1);

  const tools = await toolSelectorChain(question, systemMessage, debug);

  const functions = functionsFactory.getFunctions(tools.response);

  ensureAIThoughtsFunction(functions, chat);
  ensureQuestionStopFunction(functions, chat);

  functions.forEach((f) => {
    chat.addSupportedFunction(f);
  });

  console.log(
    'Loaded functions: ',
    chat.getSupportedFunctions().map((x) => x.name),
  );

  return new Promise<{
    response: string;
    totalUsed: number;
  }>((resolve, reject) => {
    questionStopFunctionInstance.beforeExecute = async (response) => {
      resolve({
        response: response.finalMessage,
        totalUsed: chat.getTotalTokens(),
      });
      isFinished = true;
      return response;
    };

    chat.setIsFinished(() => {
      return isFinished === true;
    });

    async function aiResponseHandler(
      response: ChatCompletionResponseMessage,
    ): Promise<void> {
      if (response.content && chat.isDebug()) {
        console.log('AI:', response.content);
      }
      //console.warn('RAW MESSAGE:', response);
      while (chat.notFinished()) {
        await chat.hears('Continue', (nextMessage) => {
          if (nextMessage.content && chat.isDebug()) {
            console.log('AI:', nextMessage.content);
          }
        });
      }
    }

    chat.setDebug(debug);
    chat.hears(question, aiResponseHandler).catch((err) => {
      reject(err);
    });
  });
}

export default questionChain;
