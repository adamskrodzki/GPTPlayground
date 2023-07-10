import 'jest';
import {
  QuestionStopFunction,
  questionStopFunctionDescription,
} from './question-stop-function';

describe('StopFunction', () => {
  let stopFunction: QuestionStopFunction;

  beforeEach(() => {
    stopFunction = new QuestionStopFunction();
  });

  test('should have correct name and description', () => {
    expect(stopFunction.name).toBe('question_stop_function');
    expect(stopFunction.description).toBe(questionStopFunctionDescription);
  });

  test('should have correct parameters', () => {
    const descriptor = stopFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'question_stop_function',
      description: questionStopFunctionDescription,
      parameters: {
        type: 'object',
        properties: {
          finalMessage: {
            type: 'string',
            description:
              'Justification of the AI agent for ending the conversation',
          },
        },
        required: ['finalMessage'],
      },
    });
  });

  test('execute should return correct weather', async () => {
    const weather = await stopFunction.execute(
      JSON.stringify({
        finalMessage:
          'As I provided you with all the information I have, I am going to end the conversation.',
      }),
    );

    expect(weather).toEqual({
      role: 'function',
      name: 'question_stop_function',
      content: {
        confirmation: 'Conversation ended',
      },
    });
  });
});
