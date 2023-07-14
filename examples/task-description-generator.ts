import { readFile } from 'fs/promises';
import { getDetailedTaskDescription } from '../chat/chains/task-chain/partials';

async function runScript() {
  const args = process.argv.slice(2);
  const task = args[0];

  try {
    console.log(`Dir: ${__dirname}`);
    const filePath = `workspaces/${task}/requirements.txt`;
    const fileContent = await readFile(filePath, 'utf-8');
    const result = await getDetailedTaskDescription(fileContent, '1');
    console.log('Task:\n', JSON.stringify(result));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runScript();
