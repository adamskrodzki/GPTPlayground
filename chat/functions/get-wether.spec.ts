import 'jest';
import { WeatherFunction } from './get-wether';
  
  describe('WeatherFunction', () => {
    let weatherFunction: WeatherFunction;
  
    beforeEach(() => {
      weatherFunction = new WeatherFunction((location: string, unit: string) => Promise.resolve({ temperature: 20, description: 'Sunny' }));
    });
  
    test('should have correct name and description', () => {
      expect(weatherFunction.name).toBe('get_current_weather');
      expect(weatherFunction.description).toBe('Get the current weather in a given location');
    });
  
    test('should have correct parameters', () => {
      const descriptor = weatherFunction.toChatCompletionFunction();
  
      expect(descriptor).toEqual({
        name: 'get_current_weather',
        description: 'Get the current weather in a given location',
        parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                description: "The unit of temperature",
                enum: ["celsius", "fahrenheit"]
              }
            },
            required: ["location"]
          }
      });
    });
  
    test('execute should return correct weather', async () => {
      const weather = await weatherFunction.execute({ location: 'San Francisco, CA', unit: 'celsius' });
      
      expect(weather).toEqual({
        role: 'function',
        name: 'get_current_weather',
        content: {
            temperature: 20,
            description: 'Sunny',
            unit: 'celsius',
        }});
    });
  
    test('execute should use celsius as default unit', async () => {
      const weather = await weatherFunction.execute({ location: 'San Francisco, CA' });
      
      expect(weather.content.unit).toBe('celsius');
    });
  });