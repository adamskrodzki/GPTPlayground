import { readFile } from 'fs/promises';
import {
  getDetailedTaskDescription,
  splitTask,
} from '../chat/chains/task-chain/partials';
import { Task } from '../chat/memory/task-tracker';

async function runScript() {
  const args = process.argv.slice(2);
  const task = args[0];

  try {
    console.log(`Dir: ${__dirname}`);
    const filePath = `workspaces/${task}/requirements.txt`;
    const fileContent = await readFile(filePath, 'utf-8');
    let result = await getDetailedTaskDescription(fileContent, '1');
    let subtasks: Task[] = [];
    do {
      subtasks = await splitTask(result);
      console.log('Sub Tasks:\n', JSON.stringify(subtasks));
      result = subtasks[0];
    } while (subtasks.length > 1);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runScript();
