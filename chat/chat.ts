import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageFunctionCall,
  ChatCompletionResponseMessage,
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import config from '../common/config';
import { IChatCompletionFunction } from './base-function';

class UsageTracker {
  totalTokens: number;
  tokensUsed: number;

  constructor() {
    this.totalTokens = 0;
    this.tokensUsed = 0;
  }

  public track(usage: CreateCompletionResponseUsage) {
    //track total amount of tokens used
    this.totalTokens += usage.total_tokens;
    //track amount of tokens used by this request
    this.tokensUsed = usage.total_tokens;
  }

  //get total amount of tokens used
  public getTotalTokens(): number {
    return this.totalTokens;
  }

  //get amount of tokens used by this request
  public getTokensUsed(): number {
    return this.tokensUsed;
  }
}

class OpenAIChat {
  private apiKey: string;
  private model: string;
  private messages: ChatCompletionRequestMessage[];
  private systemMessage: ChatCompletionRequestMessage | undefined;
  private openai: OpenAIApi;
  private maxTokens: number | undefined;
  private temperature: number | null | undefined;
  private usageTracker: UsageTracker;
  private presencePenalty: number | null | undefined;
  private frequencyPenalty: number | null | undefined;
  private _notFinished: boolean;
  private _debug: boolean;
  private functions: IChatCompletionFunction[] = [];
  isFinished: (message: ChatCompletionResponseMessage) => boolean | undefined =
    () => false;

  constructor(
    model: string | undefined = undefined,
    apiKey: string | undefined = undefined,
  ) {
    this.apiKey = apiKey || config.apiKey;
    this.model = model || config.model;
    this.messages = [];
    const configuration = new Configuration({ apiKey: this.apiKey });
    this.openai = new OpenAIApi(configuration);
    this.usageTracker = new UsageTracker();
    this._notFinished = true;
    this._debug = false;
  }

  public setDebug(debug: boolean): void {
    this._debug = debug;
  }

  setIsFinished(
    isFinished: (message: ChatCompletionResponseMessage) => boolean | undefined,
  ) {
    this.isFinished = isFinished;
  }

  //get total amount of tokens used
  public getTotalTokens(): number {
    return this.usageTracker.getTotalTokens();
  }

  public notFinished(): boolean {
    return this._notFinished;
  }

  //get amount of tokens used by this request
  public getTokensUsed(): number {
    return this.usageTracker.getTokensUsed();
  }

  public setSystemMessage(message: string): void {
    this.systemMessage = {
      role: 'system',
      content: message,
    };
  }

  public getMessages(): ChatCompletionRequestMessage[] {
    return this.messages;
  }

  public getSupportedFunctions(): IChatCompletionFunction[] {
    return this.functions;
  }

  public addSupportedFunction(functionToAdd: IChatCompletionFunction): void {
    this.functions.push(functionToAdd);
  }

  public updateSupportedFunctions(functions: IChatCompletionFunction[]): void {
    this.functions = functions;
  }

  public async executeFunction(
    functionCall: ChatCompletionRequestMessageFunctionCall,
  ): Promise<ChatCompletionRequestMessage> {
    const functionToExecute = this.functions.find(
      (x) => x.name === functionCall.name,
    );
    if (functionToExecute) {
      const result = await functionToExecute.execute(functionCall.arguments!);
      return {
        role: 'function',
        name: functionCall.name,
        content: JSON.stringify(result),
      };
    } else {
      throw new Error(`Function ${functionCall.name} not supported`);
    }
  }

  public async addSelfMessage(message: ChatCompletionResponseMessage) {
    if (message.function_call) {
      this.messages.push(message);
      const executionResult: ChatCompletionRequestMessage =
        await this.executeFunction(message.function_call);
      this.messages.push(executionResult);

      if (this.isFinished && this.isFinished(executionResult)) {
        this._notFinished = false;
      }
    } else {
      if (message.content) {
        if (message.role === 'assistant') {
          this.messages.push({
            role: 'assistant',
            content: message.content,
          });
        }
      } else {
        throw new Error('Message content or function call must be provided');
      }
    }
  }

  public async hears(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handler: (response: ChatCompletionResponseMessage) => void = () => {},
  ): Promise<void> {
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: message,
    };
    this.messages.push(userMessage);

    try {
      let result: CreateChatCompletionResponse;
      do {
        const conversation = this.buildConversation();
        result = await this.sendRequest(conversation);
        if (this.isFinished && this.isFinished(result.choices[0].message!)) {
          this._notFinished = false;
        }
        await this.addSelfMessage(result.choices[0].message!);
      } while (
        (result.choices[0].message?.role !== 'assistant' ||
          !result.choices[0].message?.content) &&
        this._notFinished
      );
      handler({
        content: result.choices[0].message?.content,
        role: 'assistant',
      });
    } catch (error: any) {
      console.error('Error:', error);
      this.handleRetry(userMessage, handler);
    }
  }

  public setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }

  public getMaxTokens(): number | undefined {
    return this.maxTokens;
  }

  public setTemperature(temperature: number): void {
    this.temperature = temperature;
  }

  public getTemperature(): number | null | undefined {
    return this.temperature;
  }

  public setFrequencyPenalty(frequencyPenalty: number) {
    this.frequencyPenalty = frequencyPenalty;
  }

  public setPresencePenalty(presencePenalty: number) {
    this.presencePenalty = presencePenalty;
  }

  private buildConversation(): ChatCompletionRequestMessage[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const conversation = [this.systemMessage!, ...this.messages];
    return conversation;
  }

  private async sendRequest(
    conversation: ChatCompletionRequestMessage[],
  ): Promise<CreateChatCompletionResponse> {
    const functionDefinitions = this.functions.map((f) =>
      f.toChatCompletionFunction(),
    );

    const basicData = {
      model: this.model,
      messages: conversation,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      top_p: 1,
      presence_penalty: this.presencePenalty,
      frequency_penalty: this.frequencyPenalty,
      stream: false,
    };
    const resp = await this.openai.createChatCompletion(
      functionDefinitions.length > 0
        ? {
            ...basicData,
            ...{ functions: functionDefinitions, function_call: 'auto' },
          }
        : basicData,
    );
    this.usageTracker.track(resp.data.usage!);
    if (this._debug) {
      console.log('Request', JSON.stringify(conversation));
      console.log('Response', JSON.stringify(resp.data));
    }
    return resp.data;
  }

  public isDebug(): boolean {
    return this._debug;
  }

  private handleRetry(
    userMessage: ChatCompletionRequestMessage,
    handler: (response: ChatCompletionResponseMessage) => void,
  ): void {
    const retries = 3;
    let retryCount = 0;
    let delay = 1000;

    const retry = () => {
      setTimeout(() => {
        this.sendRequest(this.buildConversation())
          .then((response) => {
            const resp = asAssistantMessage(response);
            //TODO: handle function calls
            handler(resp);
            this.messages.push(resp);
          })
          .catch((error) => {
            console.error('Error:', error);
            retryCount++;
            delay *= 2;

            if (retryCount < retries) {
              retry();
            } else {
              this.handleRetryError(userMessage, handler, error);
            }
          });
      }, delay);
    };

    retry();
  }

  private handleRetryError(
    userMessage: ChatCompletionRequestMessage,
    handler: (response: ChatCompletionResponseMessage) => void,
    error: Error,
  ): void {
    this.messages.pop();
    const errorMessage = `Error occurred when processing your last action: ${JSON.stringify(
      error,
    )}`;
    const errorMessageObject: ChatCompletionResponseMessage = {
      role: 'user',
      content: errorMessage,
    };
    this.messages.push(errorMessageObject);
    handler(errorMessageObject);
  }
}

export { OpenAIChat, UsageTracker };
function asAssistantMessage(
  response: CreateChatCompletionResponse,
): ChatCompletionRequestMessage {
  return {
    content: response.choices[0].message?.content,
    role: 'assistant',
  };
}
