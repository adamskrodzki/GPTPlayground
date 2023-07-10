import { IChatCompletionFunction } from './base-function';
import { AIThoughtsFunction } from './functions/ai-thoughts';
import { weatherFunctionInstanceMock } from './functions/get-wether';
import { questionStopFunctionInstance } from './functions/question-stop-function';
import { writeFileFunctionInstance } from './functions/files/write-file';

class FunctionsFactory {
  private static instance: FunctionsFactory;
  private functions: { [name: string]: IChatCompletionFunction } = {};

  private constructor() {
    const aiThoughtsFunction = new AIThoughtsFunction();
    this.registerFunction(questionStopFunctionInstance);
    this.registerFunction(weatherFunctionInstanceMock);
    this.registerFunction(aiThoughtsFunction);
    this.registerFunction(writeFileFunctionInstance);
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
