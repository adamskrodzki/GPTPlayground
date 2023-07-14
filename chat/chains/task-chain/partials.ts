import { OpenAIChat } from '../../chat';
import functionsFactory from '../../functions-factory';
import {
  SimpleTask,
  Task,
  TaskStatus,
  taskTracker,
} from '../../memory/task-tracker';
import { DescribeTaskFunction } from './internal-functions/describe-task';
import { SplitTasksFunction } from './internal-functions/split-task';

async function getDetailedTaskDescription(
  task: string,
  id: string,
): Promise<Task> {
  const chat = new OpenAIChat('gpt-3.5-turbo-0613');
  chat.setDebug(true);
  chat.setTemperature(0);
  chat.setMaxTokens(2000);
  chat.setPresencePenalty(1);
  chat.setFrequencyPenalty(1);
  chat.setIsFinished((message) => {
    if (
      message.function_call &&
      message.function_call.name == 'describe-task'
    ) {
      return true;
    }
  });
  let result: Promise<Task> | undefined = undefined;
  chat.addSupportedFunction(
    new DescribeTaskFunction(
      (title, description, definitionOfDone, recommendedFunctions) => {
        const task = new Task(
          title,
          description,
          TaskStatus.TODO,
          id,
          definitionOfDone,
          recommendedFunctions,
        );
        taskTracker.add(task);
        result = Promise.resolve(task);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return result!;
      },
    ),
  );
  chat.setSystemMessage(
    'User will write you unstructured description of a task, your task is to call describe-task function with title, description and definitionOfDone that best describes the task that was provided to you by a user, ' +
      'list of available tools: \r\n' +
      functionsFactory.ListAvailableFunctions(),
  );
  const text =
    'Please, process following task for me, by calling describe-task function: \n\n Task: \n' +
    task;
  await chat.hears(text);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result!;
}

async function splitTask(input: Task): Promise<Task[]> {
  const chat = new OpenAIChat('gpt-3.5-turbo-0613');
  chat.setDebug(true);
  chat.setTemperature(0);
  chat.setMaxTokens(2000);
  chat.setPresencePenalty(1);
  chat.setFrequencyPenalty(1);
  chat.setIsFinished((message) => {
    if (message.function_call && message.function_call.name == 'split-task') {
      return true;
    }
  });
  let result: Task[] = [input];
  chat.addSupportedFunction(
    new SplitTasksFunction((tasks: SimpleTask[]) => {
      if (
        tasks.length > 1 ||
        (tasks.length == 1 && tasks[0].title != input.title)
      ) {
        result = [];
        tasks.forEach((task, idx) => {
          const newTask = new Task(
            task.title,
            task.description,
            TaskStatus.TODO,
            `${input.id}.${idx + 1}`,
            task.definitionOfDone,
            task.recommendetFunctions,
          );
          taskTracker.add(newTask);
          result.push(newTask);
        });
      }

      return Promise.resolve(result);
    }),
  );

  chat.setSystemMessage(
    'As an experienced analytical AI, you are tasked with assisting a  \
   less capable bot in carrying out a potentially complex task. Your goal is to divide the larger task\
   into sequence of up to five smaller subtasks, with each subtask being dependent only on its predecessors. \
   Doing subtasks step by step should be simpler than original task \
   If you believe the task cannot be divided further, you should output the same task as the only \
   parameter of split-task function. You will have several available tools to use: \r\n' +
      functionsFactory.ListAvailableFunctions(),
  ) +
    'Given these tools, please provide a step-by-step breakdown of how you would split the main task \
   into subtasks, which tool(s) you would use for each subtask, and how each subtask supports \
   the completion of the main task. Pay attention to the fact that every subtask should be dependent only on previous tasks as they will be done in sequence ';
  const text =
    'Please, process following task for me, by calling split-task function: \n\n Task: \n' +
    input.toString();
  await chat.hears(text);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return result!;
}

export { getDetailedTaskDescription, splitTask };
