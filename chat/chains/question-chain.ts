import { questionStopFunctionInstance } from '../functions/question-stop-function';
import { processChain } from './common';
const systemMessage =
  "As an intelligent assistant, your task is to use the functions available to you to answer question user have. \
If you lack the necessary functions, your response should be based on the most accurate knowledge in your dataset. \
When you gather all necessary information call question_stop_function. \
Prior to answering, please describe your thought process step-by-step by calling the 'ai_thoughts' function. \
This includes identifying the user's request, understanding what functions or knowledge are necessary to fulfil it, and explaining \
how you plan to utilize these resources to generate an appropriate response. Always remember to inform the user about your thought \
process before you execute any action. Transparency in what you do enhances user experience and trust. This way, the user understands \
how their requests are handled.";

// The question and task chains now utilize the common function
async function questionChain(
  question: string,
  debug = false,
): Promise<{
  response: string;
  totalUsed: number;
}> {
  return processChain(
    question,
    questionStopFunctionInstance,
    systemMessage,
    debug,
  );
}

export default questionChain;
