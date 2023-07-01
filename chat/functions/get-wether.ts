import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../base-function";


type FetchWeatherFunction = (location: string, unit: string) => Promise<{ temperature: number, description: string }>;

enum WeatherUnit {
    Celsius = 'celsius',
    Fahrenheit = 'fahrenheit'
}

type WeatherFunctionParameters = {
    location: string;
    unit?: WeatherUnit;
    addEnumForProperty: (name: string) => string[] | undefined;
    addDescriptionOfProperty: (name: string) => string | undefined;
    excludeFromRequired: () => string[];
}

type WeatherFunctionResult = {
    temperature: number;
    unit: WeatherUnit;
    description: string;
}

class WeatherFunction extends ChatCompletionFunctionBase<WeatherFunctionParameters, WeatherFunctionResult> {
    public name = 'get_current_weather';
    public description = 'Get the current weather in a given location';

    public exampleInput = {
        location : 'San Francisco, CA',
        unit: WeatherUnit.Celsius,
        addEnumForProperty: (name: string) : string[] | undefined => {
            switch(name) {  
                case 'unit': {
                    return Object.values(WeatherUnit);
                }
                default: {
                    return undefined
                }
            }
        },
        excludeFromRequired: () => ['unit'],
        addDescriptionOfProperty: (name: string) => {
            switch(name) {  
                case 'location': {
                    return 'The city and state, e.g. San Francisco, CA';
                }
                case 'unit': {
                    return 'The unit of temperature, enum of celsius or fahrenheit';
                }
                default: {
                    return undefined;
                }
            }
        },
    }

    constructor(private _fetchWeatherFunction: FetchWeatherFunction) {
        super();
    }

    async executeImplementation(parameters: WeatherFunctionParameters) : Promise<ChatCompletionFunctionExecutionResult<WeatherFunctionResult>>{
        const location = parameters['location'];
        const unit = parameters['unit'] || WeatherUnit.Celsius; // set default unit as celsius

        // Assuming we have a weather API service to fetch weather
        const weather = await this._fetchWeather(location, unit);

        return {
            role: 'function',
            name: this.name,
            content: {
                temperature: weather.temperature,
                description: weather.description,
                unit: unit as WeatherUnit
            }
        };
    }

    private async _fetchWeather(location: string, unit: string) : Promise<{ temperature: number, description: string }> {
        return this._fetchWeatherFunction(location, unit);
    }
}

const weatherFunctionInstanceMock = new WeatherFunction((location: string, unit: string) => Promise.resolve({ temperature: 20, description: 'Sunny' }));

export { weatherFunctionInstanceMock, WeatherFunction, FetchWeatherFunction, WeatherUnit }