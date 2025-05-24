import { ChatOpenAI } from '@langchain/openai';

export const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });
