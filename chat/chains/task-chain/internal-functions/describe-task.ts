import functionsFactory from '../../../functions-factory';
import {
  ChatCompletionFunctionBase,
  ChatCompletionFunctionExecutionResult,
} from '../../../base-function';
import { Task } from '../../../memory/task-tracker';

class DescribeTaskParameters {
  public title: string | undefined;
  public description: string | undefined;
  public definitionOfDone: string[] | undefined;
  public recommendedFunctions: string[] | undefined;
  public addDescriptionOfProperty: (name: string) => string | undefined = () =>
    undefined;
}

class DescribeTaskFunction extends ChatCompletionFunctionBase<
  DescribeTaskParameters,
  Task
> {
  public exampleInput: DescribeTaskParameters = {
    title: 'Create "great_jokes.txt" File with Chuck Norris Jokes',
    description:
      'Description: Create a file named "great_jokes.txt" in the designated result directory. The file should contain a list of 50 jokes, with each joke on a new line. All jokes should revolve around the common theme of "Chuck Norris."',
    definitionOfDone: [
      'File with 50 jokes is created and saved to the file system',
      'information about name and location of the file is privided in task outcome',
      'content of a file is saved in knowledge base',
    ],
    recommendedFunctions: [
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
  };

  public constructor(
    private handler: (
      title: string,
      description: string,
      definitionOfDone: string[],
      recommendedFunctions: string[],
    ) => Promise<Task>,
  ) {
    super();
  }
  protected executeImplementation(
    parameters: DescribeTaskParameters,
  ): Promise<ChatCompletionFunctionExecutionResult<Task>> {
    return this.handler(
      parameters.title!,
      parameters.description!,
      parameters.definitionOfDone!,
      parameters.recommendedFunctions!,
    ).then((task) => {
      return {
        role: 'function',
        name: 'describe-task',
        content: task,
      };
    });
  }
  public name = 'describe-task';
  public description =
    'allows AI agent to describe a task in structured manner to the user by generating title, description, definitionOfDone and list of recommendedFunctions \n';
}

export { DescribeTaskFunction, DescribeTaskParameters };
