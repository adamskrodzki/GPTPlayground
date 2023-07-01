import { Schema, createSchema } from "alt-genson-js/dist";

type ChatCompletionFunction = {
    name: string;
    description: string;
    parameters?: Schema;
  };

type ChatCompletionFunctionExecutionResult<T> = {
    role: "function";
    name: string;
    content: T;
};

interface IChatCompletionFunction {
    name: string;
    description: string;
    execute(input: string): Promise<ChatCompletionFunctionExecutionResult<any>>;
    toChatCompletionFunction(): ChatCompletionFunction;
}
  
abstract class ChatCompletionFunctionBase<Input, Result> implements IChatCompletionFunction {
    public abstract name: string;
    public abstract description: string;
    public abstract exampleInput: Input;

    protected abstract executeImplementation(parameters: Input): Promise<ChatCompletionFunctionExecutionResult<Result>>;

    public beforeExecute : (parameters: Input) => Promise<Input> = async (parameters: Input) => { return parameters; };
    public afterExecute : (result: ChatCompletionFunctionExecutionResult<Result>) => Promise<ChatCompletionFunctionExecutionResult<Result>> = async (result: ChatCompletionFunctionExecutionResult<Result>) => { return result; };
  

    public async execute(input : string) : Promise<ChatCompletionFunctionExecutionResult<any>> {
      const parameters = JSON.parse(input) as Input;
      return this.afterExecute( await this.executeImplementation(await this.beforeExecute(parameters)));
    }
  
    public toChatCompletionFunction(): ChatCompletionFunction {
      createSchema(this.exampleInput);
      return {
        name: this.name,
        description: this.description,
        parameters: createSchema(this.exampleInput),
      };
    }
  
  }

export { ChatCompletionFunctionBase, ChatCompletionFunction, ChatCompletionFunctionExecutionResult, IChatCompletionFunction };