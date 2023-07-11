import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../../base-function';
import * as fs from 'fs';
import * as path from 'path';

export interface ReadFileParameters {
  fileName: string;
  directory?: string;
  addDescriptionOfProperty: (name: string) => string | undefined;
}

export interface ReadFileResult {
  fileName: string;
  content: string;
  isError: boolean;
}

export class ReadFileFunction extends ChatCompletionFunctionBase<
  ReadFileParameters,
  ReadFileResult
> {
  protected executeImplementation(
    parameters: ReadFileParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<ReadFileResult>> {
    const { fileName, directory } = parameters;
    const filePath = directory ? path.join(directory, fileName) : fileName;
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
          resolve({
            role: 'function',
            name: 'read_file',
            content: {
              fileName: fileName,
              content: `Error: ${error.message}`,
              isError: true,
            },
          });
        } else {
          resolve({
            role: 'function',
            name: 'read_file',
            content: {
              fileName: fileName,
              content: data,
              isError: false,
            },
          });
        }
      });
    });
  }

  public description =
    'Read the content of a file, returns JSON in the format {fileName: "name_of_file.txt", content: "file content", isError: false} or a string with the error message';
  public name = 'read_file';

  public exampleInput: ReadFileParameters = {
    fileName: 'test.txt',
    directory: '/home/user',
    addDescriptionOfProperty: (name: string) => {
      switch (name) {
        case 'fileName':
          return 'The name of the file to read the content from';
        case 'directory':
          return 'The directory of the file to read the content from';
        default:
          return undefined;
      }
    },
  };
}
