// list-files.ts
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../base-function';
import * as fs from 'fs';

export interface ListFilesParameters {
  directory: string;
  addDescriptionOfProperty: (name: string) => string | undefined;
}

export type ListFilesResult = string[];

export class ListFilesFunction extends ChatCompletionFunctionBase<
  ListFilesParameters,
  ListFilesResult
> {
  protected executeImplementation(
    parameters: ListFilesParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<ListFilesResult>> {
    const { directory } = parameters;
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (error, files) => {
        if (error) {
          resolve({
            role: 'function',
            name: 'list_files',
            content: [`Error: ${error.message}`],
          });
        } else {
          resolve({
            role: 'function',
            name: 'list_files',
            content: files,
          });
        }
      });
    });
  }

  public description =
    'List all files in a directory, returns an array of objects in the following format ["filename1.txt", "filename2.txt"] or a string with the error message';
  public name = 'list_files';

  public exampleInput: ListFilesParameters = {
    directory: '/home/user',
    addDescriptionOfProperty: (name: string) => {
      switch (name) {
        case 'directory':
          return 'The directory of the files to list';
        default:
          return undefined;
      }
    },
  };
}
