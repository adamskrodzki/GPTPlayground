//run-shell function which extends ChatCompletionFunctionBase class from base-function.ts
//tests describing a function available in GPTPlayground/chat/functions/run-shell.spec.ts
//similar to weatherFunctionInstance in GPTPlayground/functions/get-weather.ts
//also implements RunShellFunctionParameters interface and RunShellFunctionResult

import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../base-function";
import { exec } from 'child_process';

export interface RunShellFunctionParameters {
    command: string;
    addDescriptionOfProperty: (name: string) => string | undefined;
}

export interface RunShellFunctionResult {
    output: string;
    isError: boolean;
}

export class RunShellFunction extends ChatCompletionFunctionBase<RunShellFunctionParameters, RunShellFunctionResult>  {
    protected executeImplementation(parameters: RunShellFunctionParameters): Promise<ChatCompletionFunctionExecutionResult<RunShellFunctionResult>> {
        const { command } = parameters;
        return new Promise((resolve, reject) => {
            try {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            role: 'function',
                            name: 'run_shell',
                            content: {
                                output: `Error: ${error.message}`,
                                isError: true
                            }
                        });
                    } else if (stderr) {
                        resolve({
                            role: 'function',
                            name: 'run_shell',
                            content: {
                                output: `Error: ${stderr}`,
                                isError: true
                            }
                        });
                    } else {
                        resolve({
                            role: 'function',
                            name: 'run_shell',
                            content: {
                                output: stdout,
                                isError: false
                            }
                        });
                    }
                });
            } catch (e) {
                if (e instanceof Error) {
                    reject(`Execution error: ${e.message}`);
                } else {
                    reject('Execution error: An unknown error occurred');
                }
            }
        });
    }
    public description = 'Allows AI agent to run Linux shell commands. If function works correctly, it returns exactly what the shell command outputs to stdout if shell command is executed correctly. If shell command is not executed correctly, it returns tesx starting with Error: and then the error message';
    public name = 'run_shell';

    public exampleInput: RunShellFunctionParameters = {
        command: 'echo "hello world"',
        addDescriptionOfProperty: (name: string) => {
            switch (name) {
                case 'command':
                    return 'shell command to be executed';
                default:
                    return undefined;
            }
        }
    }

}