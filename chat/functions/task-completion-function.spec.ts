import 'jest';
import {
  TaskCompletionFunction,
  taskCompletionFunctionDescription,
} from './task-completion-function';

describe.only('TaskCompletionFunction', () => {
  let taskCompletionFunction: TaskCompletionFunction;

  beforeEach(() => {
    taskCompletionFunction = new TaskCompletionFunction();
  });

  test('should have correct name and description', () => {
    expect(taskCompletionFunction.name).toBe('task_completion_function');
    expect(taskCompletionFunction.description).toBe(taskCompletionFunctionDescription);
  });

  test('should have correct parameters', () => {
    const descriptor = taskCompletionFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'task_completion_function',
      description: taskCompletionFunctionDescription,
      parameters: {
        type: 'object',
        properties: {
          taskSummary: {
            type: 'string',
            description: 'A brief summary of the task that was completed, including the format and location of the results',
          },
          taskName: {
            type: 'string',
            description: 'The name of the task that was completed',
          },
        },
        required: ['taskSummary', 'taskName'],
      },
    });
  });

  test('execute should return task completion confirmation', async () => {
    const taskCompletion = await taskCompletionFunction.execute(
      JSON.stringify({
        taskSummary: 'The task has been completed. The results can be found at the specified location in the requested format.',
      }),
    );

    expect(taskCompletion).toEqual({
      role: 'function',
      name: 'task_completion_function',
      content: {
        confirmation: 'Task completed',
      },
    });
  });

  test('should validate taskSummary parameter', async () => {
    try {
      await taskCompletionFunction.execute(
        JSON.stringify({
          taskSummary: 123, // invalid type, should throw an error
        }),
      );
    } catch (e) {
      expect((e as Error).message).toContain("Parameter 'taskSummary' should be a string.");
    }
  });

  test('should require taskSummary parameter', async () => {
    try {
      await taskCompletionFunction.execute(JSON.stringify({}));
    } catch (e) {
      expect((e as Error).message).toContain("Missing required parameter 'taskSummary'.");
    }
  });
});
