// split-long-file.spec.ts
import 'jest';
import { SplitLongFileFunction, SplitLongFileResult } from './split-long-file';
import { ChatCompletionFunctionExecutionResult } from '../base-function';
import { promises as fsPromises, existsSync, mkdirSync } from 'fs';

const splitLongFileFunction = new SplitLongFileFunction();

describe('SplitLongFileFunction', () => {
  const testFilePath = './test.txt';
  const testDirectoryPath = './test_directory';
  const testFileContent = '1\n'.repeat(5000); // 5000 lines of '1'

  beforeAll(async () => {
    // Create a test file before all tests
    await fsPromises.writeFile(testFilePath, testFileContent);

    // Ensure test directory exists
    if (!existsSync(testDirectoryPath)) {
      mkdirSync(testDirectoryPath, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up test files after all tests are done
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fsPromises.unlink(testFilePath).catch(() => {});
    for (let i = 0; i < 5; i++) {
      // 5
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await fsPromises
        .unlink(`${testDirectoryPath}/chunk_${i}.txt`)
        .catch(() => {});
    }
    // Remove test directory
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fsPromises.rmdir(testDirectoryPath).catch(() => {});
  });

  test('splitting a non-existing file fails', async () => {
    const result = await splitLongFileFunction.execute(
      JSON.stringify({
        sourceFileFullPath: 'non_existing_file.txt',
        maxTokens: 1000,
        overlap: 100,
        firstChunkDirectory: testDirectoryPath,
      }),
    );

    expect(
      (
        result as ChatCompletionFunctionExecutionResult<SplitLongFileResult>
      ).content[0].startsWith('Error:'),
    ).toBe(true);
  });

  test('splitting a long file works', async () => {
    const result = await splitLongFileFunction.execute(
      JSON.stringify({
        sourceFileFullPath: testFilePath,
        maxTokens: 1000,
        overlap: 100,
        firstChunkDirectory: testDirectoryPath,
      }),
    );

    expect(
      (result as ChatCompletionFunctionExecutionResult<SplitLongFileResult>)
        .content.length,
    ).toBe(6);
  });

  test('produced chunk files contain the right content', async () => {
    const chunkFilePath = `${testDirectoryPath}/chunk_0.txt`;
    const chunkContent = await fsPromises.readFile(chunkFilePath, 'utf8');
    const chunkLines = chunkContent.split('\n');

    expect(chunkLines.length).toBe(1000);
    expect(chunkLines.every((line) => line === '1')).toBe(true);
  });
});
