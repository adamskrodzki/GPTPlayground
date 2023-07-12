import { readFile } from 'fs/promises';
import { taskChain } from './../chat/chains/task-chain';

async function runScript() {
  const args = process.argv.slice(2);
  const task = args[0];
  const debug = args[1] === 'true';

  try {
    console.log(`Dir: ${__dirname}`);
    const filePath = `workspaces/${task}/requirements.txt`;
    const fileContent = await readFile(filePath, 'utf-8');
    const result = await taskChain(fileContent, task, debug);
    console.log(result.response);
    console.log(`Total used: ${result.totalUsed}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runScript();
