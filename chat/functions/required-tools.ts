//function called ai-thoughts with description "allows ai agent to explait to the user each step of hsi thought process"
// partial desciption of the function provided by tests in GPTPlayground/chat/functions/ai-thoughts.spec.ts
// similar to weatherFunctionInstance in GPTPlayground/functions/get-weather.ts

import exp from 'constants';
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../base-function';

export interface RequiredToolsFunctionParameters {
  tools: string[];
  addDescriptionOfProperty: (name: string) => string | undefined;
}

export interface RequiredToolsFunctionResult {
  confirmation: string;
}

export class RequiredToolsFunction extends ChatCompletionFunctionBase<
  RequiredToolsFunctionParameters,
  RequiredToolsFunctionResult
> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected executeImplementation(
    _parameters: RequiredToolsFunctionParameters,
  ): Promise<
    ChatCompletionFunctionExecutionResult<RequiredToolsFunctionResult>
  > {
    return Promise.resolve({
      role: 'function',
      name: 'required_tools',
      content: {
        confirmation: 'Tools selected',
      },
    });
  }
  public description =
    'Allows AI agent to inform other AI agents about the tools that are required to accomplish the task. If function works correctly, it should respond with "Tools selected"';
  public name = 'required_tools';

  public exampleInput: RequiredToolsFunctionParameters = {
    tools: ['get_weather', 'ai_thoughts'],
    addDescriptionOfProperty: (property: string) => {
      switch (property) {
        case 'tools':
          return 'list of names of the tools that are required to accomplish the task';
        default:
          return undefined;
      }
    },
  };
}

export const requiredToolsFunctionInstance = new RequiredToolsFunction();
