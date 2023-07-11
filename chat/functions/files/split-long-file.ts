// split-long-file.ts
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../../base-function';
import * as fs from 'fs';
import * as path from 'path';

export interface SplitLongFileParameters {
  sourceFileFullPath: string;
  maxTokens?: number;
  overlap?: number;
  firstChunkDirectory: string;
  addDescriptionOfProperty: (name: string) => string | undefined;
}

export type SplitLongFileResult = string[];

export class SplitLongFileFunction extends ChatCompletionFunctionBase<
  SplitLongFileParameters,
  SplitLongFileResult
> {
  protected executeImplementation(
    parameters: SplitLongFileParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<SplitLongFileResult>> {
    const {
      sourceFileFullPath,
      maxTokens = 3000,
      overlap = 0,
      firstChunkDirectory,
    } = parameters;

    return new Promise((resolve, reject) => {
      fs.readFile(sourceFileFullPath, 'utf8', (error, data) => {
        if (error) {
          resolve({
            role: 'function',
            name: 'split_long_file',
            content: [`Error: ${error.message}`],
          });
        } else {
          const lines = data.split('\n');
          const chunks = [];
          for (let i = 0; i < lines.length; i += maxTokens - overlap) {
            const chunk = lines.slice(i, i + maxTokens).join('\n');
            const chunkFilePath = path.join(
              firstChunkDirectory,
              `chunk_${i / (maxTokens - overlap)}.txt`,
            );
            fs.writeFileSync(chunkFilePath, chunk);
            chunks.push(chunkFilePath);
          }
          resolve({
            role: 'function',
            name: 'split_long_file',
            content: chunks,
          });
        }
      });
    });
  }

  public description =
    'Split a long file into smaller files, returns an array of full paths to created files in the following format ["/path/to/file/filename1.txt", "/path/to/file/filename2.txt"] or a string with the error message';
  public name = 'split_long_file';

  public exampleInput: SplitLongFileParameters = {
    sourceFileFullPath: '/home/user/my-file.txt',
    maxTokens: 1000,
    overlap: 100,
    firstChunkDirectory: '/home/user/my-directory',
    addDescriptionOfProperty: (name: string) => {
      switch (name) {
        case 'sourceFileFullPath':
          return 'The absolute path to the file to split';
        case 'maxTokens':
          return 'The maximum number of tokens in a single file';
        case 'overlap':
          return 'The number of tokens to overlap between files';
        case 'firstChunkDirectory':
          return 'The directory where the split files should be stored';
        default:
          return undefined;
      }
    },
  };
}
