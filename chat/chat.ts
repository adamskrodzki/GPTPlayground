import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import config from '../common/config';

class UsageTracker {
  totalTokens: number;
  tokensUsed: number;
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
  private systemMessage: ChatCompletionRequestMessage;
  private openai: OpenAIApi;
  private maxTokens: number | undefined;
  private temperature: number | null | undefined;
  private usageTracker: UsageTracker;
  private presencePenalty: number | null | undefined;
  private frequencyPenalty: number | null | undefined;

  constructor(
    model: string | undefined = undefined,
    apiKey: string | undefined = undefined,
  ) {
    this.apiKey = apiKey || config.apiKey;
    this.model = model || config.model;
    this.messages = [];
    const configuration = new Configuration({ apiKey: this.apiKey });
    this.openai = new OpenAIApi(configuration);
  }

  //get total amount of tokens used
  public getTotalTokens(): number {
    return this.usageTracker.getTotalTokens();
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

  public speak(
    message: string,
    handler: (response: ChatCompletionResponseMessage) => void,
  ): void {
    const userMessage: ChatCompletionRequestMessage = {
      role: 'user',
      content: message,
    };
    this.messages.push(userMessage);

    const conversation = this.buildConversation();

    this.sendRequest(conversation)
      .then((response) => {
        handler(response.choices[0].message!);
      })
      .catch((error) => {
        console.error('Error:', error);
        this.handleRetry(userMessage, handler);
      });
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
    const conversation = [...this.messages, this.systemMessage];
    return conversation;
  }

  private async sendRequest(
    conversation: ChatCompletionRequestMessage[],
  ): Promise<CreateChatCompletionResponse> {
    const resp = await this.openai.createChatCompletion({
      model: this.model,
      messages: conversation,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      top_p: 1,
      presence_penalty: this.presencePenalty,
      frequency_penalty: this.frequencyPenalty,
      stop: ['\n', ' Human:', ' AI:'],
    });
    this.usageTracker.track(resp.data.usage!);
    return resp.data;
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
            handler(response.choices[0].message!);
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
