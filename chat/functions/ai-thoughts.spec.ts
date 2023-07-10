//tests for functions/ai-thoughts.ts file
//should be similar to GPTPlayground/chat/functions/get-weather.spec.ts
//but describe function called ai-thoughts with description "allows ai agent to explait to the user each step of hsi thought process"
import 'jest';
import { AIThoughtsFunction } from './ai-thoughts';
describe('AIThoughtsFunction', () => {
  let aiThoughtsFunction: AIThoughtsFunction;
  beforeEach(() => {
    aiThoughtsFunction = new AIThoughtsFunction();
  });
  test('should have correct name and description', () => {
    expect(aiThoughtsFunction.name).toBe('ai_thoughts');
    expect(aiThoughtsFunction.description).toBe(
      'Allows AI agent to explain to the user each step of his thought process. If function works correctly, it should respond with "Thoughts saved"',
    );
  });

  test('should have correct parameters', () => {
    const descriptor = aiThoughtsFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'ai_thoughts',
      description:
        'Allows AI agent to explain to the user each step of his thought process. If function works correctly, it should respond with "Thoughts saved"',
      parameters: {
        type: 'object',
        properties: {
          task: {
            type: 'string',
            description: 'The goal that the AI agent is trying to accomplish',
          },
          plan: {
            type: 'array',
            description:
              'List of all steps that the AI agent is going to take to accomplish the task',
            items: {
              type: 'string',
            },
          },
          critique: {
            type: 'array',
            description:
              'All weakneses of the plan that the AI agent has found, together with all external factors that might influence the plan',
            items: {
              type: 'string',
            },
          },
        },
        required: ['task', 'plan', 'critique'],
      },
    });
  });

  test('execute should return confirmation message', async () => {
    const confirmation = await aiThoughtsFunction.execute(
      JSON.stringify({
        task: 'Get current weather',
        plan: ['Get location', 'Get weather'],
        critique: ['Location might be wrong', 'Weather might be wrong'],
      }),
    );

    expect(confirmation).toEqual({
      role: 'function',
      name: 'ai_thoughts',
      content: {
        confirmation: 'Thoughts saved',
      },
    });
  });
});
