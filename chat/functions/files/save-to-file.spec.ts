//jest test file for save_to_file function which extends ChatCompletionFunctionBase class from base-function.ts
//also uses SaveToFileParameters interface from save-to-file.ts and SaveToFileResult interface from save-to-file.ts

import 'jest';
import { SaveToFileFunction, SaveToFileResult } from './save-to-file';
import { ChatCompletionFunctionExecutionResult } from '../../base-function';
import { promises as fsPromises } from 'fs';

const saveToFileFunction = new SaveToFileFunction();

describe('SaveToFileFunction', () => {
  beforeEach(async () => {
    // Clean up test file before each test
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fsPromises.unlink('./test.txt').catch(() => {});
  });

  afterAll(async () => {
    // Clean up test file after all tests are done
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fsPromises.unlink('./test.txt').catch(() => {});
  });

  test('should have correct name and description', () => {
    expect(saveToFileFunction.name).toBe('save_to_file');
    expect(saveToFileFunction.description).toBe(
      'Save the content to a file. If function works correctly, it returns a message indicating the content was saved successfully. If not, it returns a text starting with Error: and then the error message',
    );
  });

  test('should have correct parameters', () => {
    const descriptor = saveToFileFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'save_to_file',
      description:
        'Save the content to a file. If function works correctly, it returns a message indicating the content was saved successfully. If not, it returns a text starting with Error: and then the error message',
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'The content to save to file',
          },
          fileName: {
            type: 'string',
            description: 'The name of the file to save the content to',
          },
        },
        required: ['content', 'fileName'],
      },
    });
  });

  test('writing to a file works', async () => {
    const result = await saveToFileFunction.execute(
      JSON.stringify({ content: 'Test content', fileName: 'test.txt' }),
    );

    expect(result).toEqual({
      role: 'function',
      name: 'save_to_file',
      content: {
        message: 'The content was saved to file',
        isError: false,
      },
    });

    const fileContent = await fsPromises.readFile('test.txt', 'utf-8');
    expect(fileContent).toBe('Test content');
  });

  test('writing to a file in subdirectory works', async () => {
    const result = await saveToFileFunction.execute(
      JSON.stringify({
        content: 'Test content',
        fileName: './workspaces/create-jokes/result/result.txt',
      }),
    );

    expect(result).toEqual({
      role: 'function',
      name: 'save_to_file',
      content: {
        message: 'The content was saved to file',
        isError: false,
      },
    });

    const fileContent = await fsPromises.readFile(
      './workspaces/create-jokes/result/result.txt',
      'utf-8',
    );
    expect(fileContent).toBe('Test content');
  });

  test('writing to a non-existing directory fails', async () => {
    const result = await saveToFileFunction.execute(
      JSON.stringify({
        content: 'Test content',
        fileName: './non_existing_dir/test.txt',
      }),
    );

    expect(
      (result as ChatCompletionFunctionExecutionResult<SaveToFileResult>)
        .content.isError,
    ).toBe(true);
    expect(
      (
        result as ChatCompletionFunctionExecutionResult<SaveToFileResult>
      ).content.message.startsWith('Error:'),
    ).toBe(true);
  });
});
