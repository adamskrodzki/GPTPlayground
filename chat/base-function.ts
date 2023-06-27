type ChatCompletionFunctionParameter = {
    type: string;
    description?: string;
    enum?: string[];
  };
  
type ChatCompletionFunctionParameterDescriptor = ChatCompletionFunctionParameter & {
  required: boolean;
};

type ChatCompletionFunction = {
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties: Record<string, ChatCompletionFunctionParameter>;
      required?: string[];
    }
  };

type ChatCompletionFunctionExecutionResult = {
    role: "function";
    name: string;
    content: Record<string, any>;
};
  
abstract class ChatCompletionFunctionBase {
    public abstract name: string;
    public abstract description: string;
  
    public abstract execute(parameters: Record<string, any>): Promise<ChatCompletionFunctionExecutionResult>;
  
    public toChatCompletionFunction(): ChatCompletionFunction {
      const parameters = this.getParameters(); 
      const required: string[] = [];
      for (const key in parameters) {
        console.log(key);
        if (((this as any)[key] as ChatCompletionFunctionParameterDescriptor).required) {
          required.push(key);
        }
      }
      return {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties: {
            ...this.getParameters(),
          },
          required: required,
        },
      };
    }
  
    protected getParameters(): Record<string, ChatCompletionFunctionParameter> {
      const parameters: Record<string, ChatCompletionFunctionParameter> = {};
      const properties = Object.getOwnPropertyNames(this);
      for (const key in properties) {
        const prop = properties[key];
        if (prop !== 'constructor' && prop !== 'execute' && prop !== 'name' && prop !== 'description' && !prop.startsWith('_')) {
          const descriptor = (this as any)[prop] as ChatCompletionFunctionParameter;
          parameters[prop] = {
            type: descriptor.type!,
            description: descriptor.description!,
            enum: descriptor.enum!,
          };
        }
      }
      console.log(parameters);
      return parameters;
    }
  }

export { ChatCompletionFunctionBase, ChatCompletionFunction, ChatCompletionFunctionParameterDescriptor, ChatCompletionFunctionExecutionResult };