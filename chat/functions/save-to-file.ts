import { writeFile } from 'fs';
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../base-function';

export interface SaveToFileParameters {
  content: string;
  fileName: string;
  addDescriptionOfProperty: (name: string) => string | undefined;
}

export interface SaveToFileResult {
  message: string;
  isError: boolean;
}

export class SaveToFileFunction extends ChatCompletionFunctionBase<
  SaveToFileParameters,
  SaveToFileResult
> {
  protected executeImplementation(
    parameters: SaveToFileParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<SaveToFileResult>> {
    const { content, fileName } = parameters;
    return new Promise((resolve, reject) => {
      try {
        writeFile(fileName, content, (error) => {
          if (error) {
            resolve({
              role: 'function',
              name: 'save_to_file',
              content: {
                message: `Error: ${error.message}`,
                isError: true,
              },
            });
          } else {
            resolve({
              role: 'function',
              name: 'save_to_file',
              content: {
                message: 'The content was saved to file',
                isError: false,
              },
            });
          }
        });
      } catch (e) {
        if (e instanceof Error) {
          reject(`Execution error: ${e.message}`);
        } else {
          reject('Execution error: An unknown error occurred');
        }
      }
    });
  }

  public description =
    'Save the content to a file. If function works correctly, it returns a message indicating the content was saved successfully. If not, it returns a text starting with Error: and then the error message';
  public name = 'save_to_file';

  public exampleInput: SaveToFileParameters = {
    content: 'Example content',
    fileName: 'example.txt',
    addDescriptionOfProperty: (name: string) => {
      switch (name) {
        case 'content':
          return 'The content to save to file';
        case 'fileName':
          return 'The name of the file to save the content to';
        default:
          return undefined;
      }
    },
  };
}
