import {
    ChatCompletionFunctionBase,
    ChatCompletionFunctionExecutionResult,
  } from '../base-function';
  
  const taskCompletionFunctionDescription =
    'Allows AI agent to inform user that a specified task has been completed. \
  If function execution is successful, taskSummary specifies the format and location of the results, otherwise it contains an error message starting with "Error:" .';
  
  export interface TaskCompletionFunctionParameters {
    addDescriptionOfProperty: (name: string) => string | undefined;
    taskName: string;
    taskSummary: string;
  }
  
  export interface TaskCompletionFunctionResult {
    confirmation: string;
  }
  
  export class TaskCompletionFunction extends ChatCompletionFunctionBase<
    TaskCompletionFunctionParameters,
    TaskCompletionFunctionResult
  > {
    protected executeImplementation(
      parameters: TaskCompletionFunctionParameters,
    ): Promise<
      ChatCompletionFunctionExecutionResult<TaskCompletionFunctionResult>
    > {
      return Promise.resolve({
        role: 'function',
        name: 'task_completion_function',
        content: {
          confirmation: 'Task completed',
        },
      });
    }
    public description = taskCompletionFunctionDescription;
    public name = 'task_completion_function';
  
    public exampleInput: TaskCompletionFunctionParameters = {
      taskSummary: 'The task has been completed. The results can be found at the specified location in the requested format.',
      taskName: 'Task name',
      addDescriptionOfProperty: (property: string) => {
        switch (property) {
          case 'taskName':
            return 'The name of the task that was completed';
          case 'taskSummary':
            return 'A brief summary of the task that was completed, including the format and location of the results';
          default:
            return undefined;
        }
      },
    };
  }
  
  const taskCompletionFunctionInstance = new TaskCompletionFunction();
  export { taskCompletionFunctionInstance, taskCompletionFunctionDescription };
  