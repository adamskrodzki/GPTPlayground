import functionsFactory from '../../../functions-factory';
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../../../base-function';
import { SimpleTask, Task } from '../../../memory/task-tracker';

class SplitTasksFunctionParameters {
  public tasks:
    | (SimpleTask & {
        addDescriptionOfProperty: (name: string) => string | undefined;
      })[]
    | undefined;
  public addDescriptionOfProperty: (name: string) => string | undefined = () =>
    undefined;
}

class SplitTasksFunction extends ChatCompletionFunctionBase<
  SplitTasksFunctionParameters,
  Task[]
> {
  public exampleInput: SplitTasksFunctionParameters = {
    tasks: [
      {
        title: 'Create "great_jokes.txt" File with Chuck Norris Jokes',
        description:
          'Description: Create a file named "great_jokes.txt" in the designated result directory. The file should contain a list of 50 jokes, with each joke on a new line. All jokes should revolve around the common theme of "Chuck Norris."',
        definitionOfDone: [
          'File with 50 jokes is created and saved to the file system',
          'information about name and location of the file is privided in task outcome',
          'content of a file is saved in knowledge base',
        ],
        recommendetFunctions: [
          'read-file',
          'save-to-file',
          'save-to-knowledge-base',
        ],
        addDescriptionOfProperty: (name: string) => {
          switch (name) {
            case 'title': {
              return 'short, but descriptive title of the task based on provided full task requirements';
            }
            case 'description': {
              return 'long detailed description of the task based on provided full task requirements, should describe in detail what needs to be done and how to accomplish the task';
            }
            case 'definitionOfDone': {
              return 'detailed description of expected outcome of a task, list of artifacts that need to be produced in order to consider the task done';
            }
            case 'recommendedFunctions': {
              return 'list of functions that can be used to accomplish the task';
            }
            default: {
              return undefined;
            }
          }
        },
      },
    ],
    addDescriptionOfProperty: (name: string) => {
      switch (name) {
        case 'tasks': {
          return '';
        }
        default: {
          return undefined;
        }
      }
    },
  };

  public constructor(
    private handler: (tasks: SimpleTask[]) => Promise<Task[]>,
  ) {
    super();
  }
  protected executeImplementation(
    parameters: SplitTasksFunctionParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<Task[]>> {
    return this.handler(parameters.tasks ?? []).then((task) => {
      return {
        role: 'function',
        name: 'split-task',
        content: task,
      };
    });
  }
  public name = 'split-task';
  public description =
    'allows ai agent to split task into multiple subtasks keeping original structure of a task, \
      but providing more granular title, description and definitionOfDone for each subtask, moreover each subtask can have its own list of specialized recommended functions';
}

export { SplitTasksFunction, SplitTasksFunctionParameters };
