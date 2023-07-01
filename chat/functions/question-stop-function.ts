//function called stop-funcition with description "allow AI agent to indicate that he is done with the conversation"
// for structure look at weatherFunctionInstance in GPTPlayground/functions/get-weather.ts

import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../base-function";

const questionStopFunctionDescription = "Allows AI agent inform user that he came up with final answer and what the answer is. \
If function execution is successful finalMessage contains answer to the question, otherwise it contains error message starting with \"Error:\" .";


export interface QuestionStopFunctionParameters {
    addDescriptionOfProperty: (name: string) => string | undefined;
    finalMessage: string;
}

export interface QuestionStopFunctionResult {
    confirmation: string;
}

export class QuestionStopFunction extends ChatCompletionFunctionBase<QuestionStopFunctionParameters, QuestionStopFunctionResult>  {

    protected executeImplementation(parameters: QuestionStopFunctionParameters): Promise<ChatCompletionFunctionExecutionResult<QuestionStopFunctionResult>> {
        return Promise.resolve({
            role: 'function',
            name: 'question_stop_function',
            content: {
                confirmation: "Conversation ended"
            }
        });
    }
    public description = questionStopFunctionDescription;
    public name = 'question_stop_function';

    public exampleInput: QuestionStopFunctionParameters = {
        finalMessage: 'As I provided you with all the information I have, I am going to end the conversation.',
        addDescriptionOfProperty: (property: string) => {
            switch (property) {
                case 'finalMessage':
                    return 'Justification of the AI agent for ending the conversation';
                default:
                    return undefined;
            }
        }
    };
}

const questionStopFunctionInstance = new QuestionStopFunction();
export {
    questionStopFunctionInstance,
    questionStopFunctionDescription
};