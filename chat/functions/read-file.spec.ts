import 'jest';
import { ReadFileFunction, ReadFileResult } from './read-file';
import { ChatCompletionFunctionExecutionResult } from '../base-function';
import { promises as fsPromises } from 'fs';

const readFileFunction = new ReadFileFunction();

describe('ReadFileFunction', () => {
  beforeAll(async () => {
    // Create a test file before all tests
    await fsPromises.writeFile('./test.txt', 'Test content');
  });

  afterAll(async () => {
    // Clean up test file after all tests are done
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fsPromises.unlink('./test.txt').catch(() => {});
  });

  test('should have correct name and description', () => {
    expect(readFileFunction.name).toBe('read_file');
    expect(readFileFunction.description).toBe(
      'Read the content of a file, returns JSON in the format {fileName: "name_of_file.txt", content: "file content", isError: false} or a string with the error message',
    );
  });

  test('should have correct parameters', () => {
    const descriptor = readFileFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'read_file',
      description:
        'Read the content of a file, returns JSON in the format {fileName: "name_of_file.txt", content: "file content", isError: false} or a string with the error message',
      parameters: {
        type: 'object',
        properties: {
          fileName: {
            type: 'string',
            description: 'The name of the file to read the content from',
          },
          directory: {
            type: 'string',
            description: 'The directory of the file to read the content from',
          },
        },
        required: ['fileName', 'directory'],
      },
    });
  });

  test('reading a file works', async () => {
    const result = await readFileFunction.execute(
      JSON.stringify({ fileName: 'test.txt' }),
    );

    expect(result).toEqual({
      role: 'function',
      name: 'read_file',
      content: {
        fileName: 'test.txt',
        content: 'Test content',
        isError: false,
      },
    });
  });

  test('reading a non-existing file fails', async () => {
    const result = await readFileFunction.execute(
      JSON.stringify({ fileName: 'non_existing_file.txt' }),
    );

    expect(
      (result as ChatCompletionFunctionExecutionResult<ReadFileResult>).content
        .isError,
    ).toBe(true);
    expect(
      (
        result as ChatCompletionFunctionExecutionResult<ReadFileResult>
      ).content.content.startsWith('Error:'),
    ).toBe(true);
  });
});
