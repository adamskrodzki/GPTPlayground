import { IChatCompletionFunction } from './base-function';
import { weatherFunctionInstanceMock } from './functions/get-wether';
import { questionStopFunctionInstance } from './functions/question-stop-function';
import { RunShellFunction } from './functions/run-shell';
import { ReadFileFunction } from './functions/files/read-file';
import { SplitLongFileFunction } from './functions/files/split-long-file';
import { SaveToFileFunction } from './functions/files/save-to-file';

class FunctionsFactory {
  private static instance: FunctionsFactory;
  private functions: { [name: string]: IChatCompletionFunction } = {};

  private constructor() {
    const runShellCommandFunction = new RunShellFunction();
    const readFileFunction = new ReadFileFunction();
    const writeFileFunctionInstance = new SaveToFileFunction();
    const splitLongFileFunction = new SplitLongFileFunction();
    this.registerFunction(questionStopFunctionInstance);
    this.registerFunction(weatherFunctionInstanceMock);
    this.registerFunction(writeFileFunctionInstance);
    this.registerFunction(readFileFunction);
    this.registerFunction(splitLongFileFunction);
    this.registerFunction(runShellCommandFunction);
  }

  private registerFunction(functionToRegister: IChatCompletionFunction): void {
    this.functions[functionToRegister.name] = functionToRegister;
  }

  public static getInstance(): FunctionsFactory {
    if (!FunctionsFactory.instance) {
      FunctionsFactory.instance = new FunctionsFactory();
    }

    return FunctionsFactory.instance;
  }

  public getFunctions(functionNames: string[]): IChatCompletionFunction[] {
    return functionNames
      .filter((x) => this.functions[x])
      .map((x) => this.functions[x]);
  }

  public ListAvailableFunctions(): string {
    return Object.keys(this.functions)
      .map(
        (x) => `${this.functions[x].name} - ${this.functions[x].description}`,
      )
      .join('\r\n');
  }
}

const functionsFactory = FunctionsFactory.getInstance();
export default functionsFactory;
