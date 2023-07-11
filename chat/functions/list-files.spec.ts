// list-files.spec.ts
import 'jest';
import { ListFilesFunction, ListFilesResult } from './list-files';
import { ChatCompletionFunctionExecutionResult } from '../base-function';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

const listFilesFunction = new ListFilesFunction();

describe('ListFilesFunction', () => {
  beforeAll(async () => {
    // Create some test files before all tests
    await fsPromises.writeFile('./test1.txt', 'Test content');
    await fsPromises.writeFile('./test2.txt', 'Test content');
  });

  afterAll(async () => {
    // Clean up test files after all tests are done
    await fsPromises.unlink('./test1.txt').catch(() => {});
    await fsPromises.unlink('./test2.txt').catch(() => {});
  });

  test('should have correct name and description', () => {
    expect(listFilesFunction.name).toBe('list_files');
    expect(listFilesFunction.description).toBe(
      'List all files in a directory, returns an array of objects in the following format ["filename1.txt", "filename2.txt"] or a string with the error message',
    );
  });

  test('should have correct parameters', () => {
    const descriptor = listFilesFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'list_files',
      description:
        'List all files in a directory, returns an array of objects in the following format ["filename1.txt", "filename2.txt"] or a string with the error message',
      parameters: {
        type: 'object',
        properties: {
          directory: {
            type: 'string',
            description: 'The directory of the files to list',
          },
        },
        required: ['directory'],
      },
    });
  });

  test('listing files works', async () => {
    const directory = process.cwd();
    const result = await listFilesFunction.execute(JSON.stringify({ directory }));

    expect(result.role).toBe('function');
    expect(result.name).toBe('list_files');
    expect((result as ChatCompletionFunctionExecutionResult<ListFilesResult>).content).toContain('test1.txt');
    expect((result as ChatCompletionFunctionExecutionResult<ListFilesResult>).content).toContain('test2.txt');
  });

  test('listing a non-existing directory fails', async () => {
    const directory = path.join(process.cwd(), 'non_existing_directory');
    const result = await listFilesFunction.execute(JSON.stringify({ directory }));

    expect(
      (result as ChatCompletionFunctionExecutionResult<ListFilesResult>).content[0].startsWith('Error:'),
    ).toBe(true);
  });
});
