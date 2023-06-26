import { ChatCompletionFunctionBase, ChatCompletionFunctionParameterDescriptor } from "../base-function";


type FetchWeatherFunction = (location: string, unit: string) => Promise<{ temperature: number, description: string }>;

class WeatherFunction extends ChatCompletionFunctionBase {
    public name = 'get_current_weather';
    public description = 'Get the current weather in a given location';

    public location : ChatCompletionFunctionParameterDescriptor = {
        description: 'The city and state, e.g. San Francisco, CA',
        type: "string",
        required: true
    };

    public unit : ChatCompletionFunctionParameterDescriptor = {
        description: 'The unit of temperature',
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        required: false
    };

    constructor(private _fetchWeatherFunction: FetchWeatherFunction) {
        super();
    }

    async execute(parameters: Record<string, any>) {
        const location = parameters['location'];
        const unit = parameters['unit'] || 'celsius'; // set default unit as celsius

        // Assuming we have a weather API service to fetch weather
        const weather = await this._fetchWeather(location, unit);

        return {
            temperature: weather.temperature,
            unit: unit,
            description: weather.description,
        };
    }

    private async _fetchWeather(location: string, unit: string) : Promise<{ temperature: number, description: string }> {
        return this._fetchWeatherFunction(location, unit);
    }
}

const weatherFunctionInstance = new WeatherFunction((location: string, unit: string) => Promise.resolve({ temperature: 20, description: 'Sunny' }));

export { weatherFunctionInstance, WeatherFunction, FetchWeatherFunction }