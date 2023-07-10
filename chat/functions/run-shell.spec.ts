//jest test file for run-shell function which extends ChatCompletionFunctionBase class from base-function.ts
//also uses RunShellFunctionParameters interface from run-shell.ts and RunShellFunctionResult interface from run-shell.ts

import 'jest';
import { RunShellFunction, RunShellFunctionResult } from './run-shell';
import { ChatCompletionFunctionExecutionResult } from '../base-function';

const runShellFunction = new RunShellFunction();

describe('RunShellFunction', () => {
    test('should have correct name and description', () => {
        expect(runShellFunction.name).toBe('run_shell');
        expect(runShellFunction.description).toBe('Allows AI agent to run Linux shell commands. If function works correctly, it returns exactly what the shell command outputs to stdout if shell command is executed correctly. If shell command is not executed correctly, it returns tesx starting with Error: and then the error message');
    });

    test('should have correct parameters', () => {
        const descriptor = runShellFunction.toChatCompletionFunction();

        expect(descriptor).toEqual({
            name: 'run_shell',
            description: 'Allows AI agent to run Linux shell commands. If function works correctly, it returns exactly what the shell command outputs to stdout if shell command is executed correctly. If shell command is not executed correctly, it returns tesx starting with Error: and then the error message',
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "shell command to be executed"
                    }
                },
                required: ["command"]
            }
        });
    });

    test('execing echo works', async () => {
        const result = await runShellFunction.execute(JSON.stringify({ command: 'echo "hello world"' }));

        expect(result).toEqual({
            role: 'function',
            name: 'run_shell',
            content: {
                output: "hello world\n",
                isError: false
            }});
    });

    test('executing ps works"', async () => {
        const result = await runShellFunction.execute(JSON.stringify({ command: 'ps' }));

        expect((result as ChatCompletionFunctionExecutionResult<RunShellFunctionResult>).content.output.startsWith("  PID TTY")).toBe(true);
    });

    test('executing git works"', async () => {
        const result = await runShellFunction.execute(JSON.stringify({ command: 'git status' }));

        expect((result as ChatCompletionFunctionExecutionResult<RunShellFunctionResult>).content.output.startsWith("On branch main")).toBe(true);
    });

});