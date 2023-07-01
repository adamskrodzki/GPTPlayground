//function called ai-thoughts with description "allows ai agent to explait to the user each step of hsi thought process"
// partial desciption of the function provided by tests in GPTPlayground/chat/functions/ai-thoughts.spec.ts
// similar to weatherFunctionInstance in GPTPlayground/functions/get-weather.ts

import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../base-function";

export interface AIThoughtsFunctionParameters {
    task: string;
    plan: string[];
    critique: string[];
    addDescriptionOfProperty: (name: string) => string | undefined;
}

export interface AIThoughtsFunctionResult {
    confirmation: string;
}

export class AIThoughtsFunction extends ChatCompletionFunctionBase<AIThoughtsFunctionParameters, AIThoughtsFunctionResult>  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected executeImplementation(_parameters: AIThoughtsFunctionParameters): Promise<ChatCompletionFunctionExecutionResult<AIThoughtsFunctionResult>> {
        return Promise.resolve({
            role: 'function',
            name: 'ai_thoughts',
            content: {
                confirmation: "Thoughts saved"
            }
        });
    }
    public description = 'Allows AI agent to explain to the user each step of his thought process. If function works correctly, it should respond with "Thoughts saved"';
    public name = 'ai_thoughts';

    public exampleInput: AIThoughtsFunctionParameters = {
        task: 'Get current weather',
        plan: ['Get location', 'Get weather'],
        critique: ['Location might be wrong', 'Weather might be wrong'],
        addDescriptionOfProperty: (property: string) => {
            switch (property) {
                case 'task':
                    return 'The goal that the AI agent is trying to accomplish';
                case 'plan':
                    return 'List of all steps that the AI agent is going to take to accomplish the task';
                case 'critique':
                    return 'All weakneses of the plan that the AI agent has found, together with all external factors that might influence the plan';
                default:
                    return undefined;
            }
        }
    };


}