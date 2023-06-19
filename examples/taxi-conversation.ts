import { OpenAIChat } from '../chat/chat';
const taxiDriver = new OpenAIChat();
const tourist = new OpenAIChat();

// Set system messages for each agent
taxiDriver.setSystemMessage(
  "You have been assigned a passenger at the airport. Start a conversation with them. Remember, not to say 'Empire State Building' until the destination is reached.",
);
tourist.setSystemMessage(
  'Hello! I need to get to the Empire State Building. Can you take me there?',
);

// Function to handle the conversation between the two agents
const converse = () => {
  // Taxi driver speaks first
  taxiDriver.speak('', (response) => {
    console.log('Taxi Driver:', response.content);

    // Tourist responds
    tourist.speak(response.content!, (response) => {
      console.log('Tourist:', response.content);

      // Continue the conversation until the destination is reached
      if (!response.content!.includes('Empire State Building')) {
        // Swap roles and continue the conversation
        taxiDriver.speak(response.content!, converse);
      } else {
        console.log(
          'Taxi Driver: We have arrived at the Empire State Building. Enjoy your visit!',
        );
      }
    });
  });
};

// Set temperature, max tokens, and penalties for both agents
taxiDriver.setTemperature(0);
taxiDriver.setMaxTokens(50);
taxiDriver.setPresencePenalty(1);
taxiDriver.setFrequencyPenalty(1);

tourist.setTemperature(0);
tourist.setMaxTokens(50);
tourist.setPresencePenalty(1);
tourist.setFrequencyPenalty(1);

// Start the conversation
converse();
