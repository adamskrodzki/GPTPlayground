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
  
abstract class ChatCompletionFunctionBase<Input, Result> {
    public abstract name: string;
    public abstract description: string;
    public abstract exampleInput: Input;
  
    public abstract execute(parameters: Input): Promise<ChatCompletionFunctionExecutionResult<Result>>;
  
    public toChatCompletionFunction(): ChatCompletionFunction {
      createSchema(this.exampleInput);
      return {
        name: this.name,
        description: this.description,
        parameters: createSchema(this.exampleInput),
      };
    }
  
  }

export { ChatCompletionFunctionBase, ChatCompletionFunction, ChatCompletionFunctionExecutionResult };