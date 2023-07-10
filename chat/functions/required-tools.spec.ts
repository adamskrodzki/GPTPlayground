import 'jest';
import { RequiredToolsFunction } from './required-tools';

const requiredToolsFunction = new RequiredToolsFunction();

describe('RequiredToolsFunction', () => {
  test('should have correct name and description', () => {
    expect(requiredToolsFunction.name).toBe('required_tools');
    expect(requiredToolsFunction.description).toBe(
      'Allows AI agent to inform other AI agents about the tools that are required to accomplish the task. If function works correctly, it should respond with "Tools selected"',
    );
  });

  test('should have correct parameters', () => {
    const descriptor = requiredToolsFunction.toChatCompletionFunction();

    expect(descriptor).toEqual({
      name: 'required_tools',
      description:
        'Allows AI agent to inform other AI agents about the tools that are required to accomplish the task. If function works correctly, it should respond with "Tools selected"',
      parameters: {
        type: 'object',
        properties: {
          tools: {
            type: 'array',
            description:
              'list of names of the tools that are required to accomplish the task',
            items: {
              type: 'string',
            },
          },
        },
        required: ['tools'],
      },
    });
  });

  test('execute should return "Tools selected"', async () => {
    const weather = await requiredToolsFunction.execute(
      JSON.stringify({ tools: ['get_weather', 'ai_thoughts'] }),
    );

    expect(weather).toEqual({
      role: 'function',
      name: 'required_tools',
      content: {
        confirmation: 'Tools selected',
      },
    });
  });
});
