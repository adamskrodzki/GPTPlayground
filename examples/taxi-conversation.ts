import { ChatCompletionResponseMessage } from 'openai';
import { OpenAIChat } from '../chat/chat';
const taxiDriver = new OpenAIChat();
const tourist = new OpenAIChat();

// Set system messages for each agent
taxiDriver.setSystemMessage(
  "You are a taxi driver in New York, you are at JFK airport. You are talking witha customer. Allways respond to a tourist in polite and helpfut manner and wait for a response from him. When you arrive at destination say 'We have arrived. have a nice stay sir!'.",
);

taxiDriver.setIsFinished((message: ChatCompletionResponseMessage) => {
  return message.content?.includes('We have arrived');
});

tourist.setSystemMessage(
  'You are a tourist in New York, you are at JFK airport. You want to go to the Empire State Building. You are talking to a taxi driver. Respond with natural polite message and wait for the taxi driver to respond.',
);

const taxiDriverResponseHandler = (response: ChatCompletionResponseMessage) => {
  console.log('Taxi Driver:', response.content);
  if (taxiDriver.notFinished()) {
    tourist.hears(response.content!, touristResponseHandler);
  }
};

const touristResponseHandler = (response: ChatCompletionResponseMessage) => {
  console.log('Tourist:', response.content);
  if (tourist.notFinished()) {
    taxiDriver.hears(response.content!, taxiDriverResponseHandler);
  }
};
// Function to handle the conversation between the two agents
const converse = async () => {
  await taxiDriver.addSelfMessage({
    role: 'assistant',
    content: 'Hello, how can I help You sir ?',
  });
  tourist.hears('Hello, how can I help You sir ?', touristResponseHandler);
};

// Set temperature, max tokens, and penalties for both agents
taxiDriver.setTemperature(0);
taxiDriver.setMaxTokens(200);
taxiDriver.setPresencePenalty(1);
taxiDriver.setFrequencyPenalty(1);

tourist.setTemperature(0);
tourist.setMaxTokens(200);
tourist.setPresencePenalty(1);
tourist.setFrequencyPenalty(1);

// Start the conversation
converse();
