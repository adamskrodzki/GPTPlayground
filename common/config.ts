// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const config = {
    apiKey: process.env.OPENAI_API_KEY as string,
    model: process.env.OPENAI_MODEL as string || 'gpt-3.5-turbo-16k-0613'
}

export default config;