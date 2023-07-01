//function called stop-funcition with description "allow AI agent to indicate that he is done with the conversation"
// for structure look at weatherFunctionInstance in GPTPlayground/functions/get-weather.ts

import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../base-function";

export interface StopFunctionParameters {
    addDescriptionOfProperty: (name: string) => string | undefined;
    finalMessage: string;
}

export interface StopFunctionResult {
    confirmation: string;
}

export class StopFunction extends ChatCompletionFunctionBase<StopFunctionParameters, StopFunctionResult>  {

    protected executeImplementation(parameters: StopFunctionParameters): Promise<ChatCompletionFunctionExecutionResult<StopFunctionResult>> {
        return Promise.resolve({
            role: 'function',
            name: 'stop_function',
            content: {
                confirmation: "Conversation ended"
            }
        });
    }
    public description = 'Allows AI agent to indicate that he is done with the conversation. If function works correctly, it should respond with "Conversation ended"';
    public name = 'stop_function';

    public exampleInput: StopFunctionParameters = {
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

export const stopFunctionInstance = new StopFunction();