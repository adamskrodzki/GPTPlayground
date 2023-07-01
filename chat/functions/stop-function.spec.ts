import 'jest';
import { StopFunction } from './stop-function';
  
  describe('StopFunction', () => {
    let stopFunction: StopFunction;
  
    beforeEach(() => {
      stopFunction = new StopFunction();
    });
  
    test('should have correct name and description', () => {
      expect(stopFunction.name).toBe('stop_function');
      expect(stopFunction.description).toBe('Allows AI agent to indicate that he is done with the conversation. If function works correctly, it should respond with "Conversation ended"');
    });
  
    test('should have correct parameters', () => {
      const descriptor = stopFunction.toChatCompletionFunction();
  
      expect(descriptor).toEqual({
        name: 'stop_function',
        description: 'Allows AI agent to indicate that he is done with the conversation. If function works correctly, it should respond with "Conversation ended"',
        parameters: {
            type: "object",
            properties: {
              finalMessage: {
                type: "string",
                description: "Justification of the AI agent for ending the conversation",
              }
            },
            required: ["finalMessage"]
          }
      });
    });
  
    test('execute should return correct weather', async () => {
      const weather = await stopFunction.execute(JSON.stringify({ finalMessage: 'As I provided you with all the information I have, I am going to end the conversation.' }));
      
      expect(weather).toEqual({
        role: 'function',
        name: 'stop_function',
        content: {
            confirmation: "Conversation ended"
        }});
    });
  });