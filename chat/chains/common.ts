import { ChatCompletionResponseMessage } from 'openai';
import { IChatCompletionFunction } from '../base-function';
import { OpenAIChat } from '../chat';
import functionsFactory from '../functions-factory';
import toolSelectorChain from './tools-selection-chain';

// Common parts extracted to helper functions
function ensureFunction(
  requiredFunction: IChatCompletionFunction,
  functions: IChatCompletionFunction[],
  chat: OpenAIChat,
): void {
  if (functions.filter((x) => x.name === requiredFunction.name).length === 0) {
    chat.addSupportedFunction(requiredFunction);
  }
}

async function processChain(
  input: string,
  completionFunctionInstance: IChatCompletionFunction,
  systemMessage: string,
  debug: boolean,
): Promise<{
  response: string;
  totalUsed: number;
}> {
  let isFinished = false;
  const chat = new OpenAIChat();
  chat.setSystemMessage(systemMessage);
  chat.setTemperature(0);
  chat.setMaxTokens(2000);
  chat.setPresencePenalty(1);
  chat.setFrequencyPenalty(1);
  const tools = await toolSelectorChain(input, systemMessage, debug);
  const functions = functionsFactory.getFunctions(tools.response);
  ensureFunction(completionFunctionInstance, functions, chat);
  functions.forEach((f) => chat.addSupportedFunction(f));
  console.log(
    'Loaded functions: ',
    chat.getSupportedFunctions().map((x) => x.name),
  );
  return new Promise<{
    response: string;
    totalUsed: number;
  }>((resolve, reject) => {
    (completionFunctionInstance as any).beforeExecute = async (
      response: any,
    ) => {
      const responseMessage = response.finalMessage || response.taskSummary;
      resolve({
        response: responseMessage,
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
      while (chat.notFinished()) {
        await chat.hears('Continue', (nextMessage) => {
          if (nextMessage.content && chat.isDebug()) {
            console.log('AI:', nextMessage.content);
          }
        });
      }
    }
    chat.setDebug(debug);
    chat.hears(input, aiResponseHandler).catch((err) => {
      reject(err);
    });
  });
}

export { processChain, ensureFunction };
