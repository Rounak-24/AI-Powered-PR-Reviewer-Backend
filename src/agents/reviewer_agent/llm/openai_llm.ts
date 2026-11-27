import { ChatOpenAI } from '@langchain/openai'

export const openai = new ChatOpenAI({
    model: 'gpt-6-luna',
    apiKey: process.env.OPENAI_API_KEY
})