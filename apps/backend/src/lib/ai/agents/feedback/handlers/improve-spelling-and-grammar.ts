import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { GraphAnnotation } from '../types';
import { llm } from '../../../llm';

export const improveSpellingAndGrammar = async (state: typeof GraphAnnotation.State) => {
  const { feedback } = state;

  const greatJobPrompt = `
    Fix spelling and grammatical errors in the following text. Only fix errors, don't change the meaning.
    IMPORTANT: If the text is in Hebrew (עברית), you must maintain it in Hebrew. Do NOT translate to any other language.
    
    ${feedback.greatJob}
    `;

  const thinkAboutPrompt = `
    Fix spelling and grammatical errors in the following text. Only fix errors, don't change the meaning.
    IMPORTANT: If the text is in Hebrew (עברית), you must maintain it in Hebrew. Do NOT translate to any other language.
    
    ${feedback.thinkAbout}
    `;

  // Fix both feedback sections independently
  const greatJobResponse = await llm.invoke([
    new SystemMessage(
      'You are a spelling and grammar correction assistant. You MUST preserve the original language of the text (Hebrew/עברית). DO NOT translate text into English or any other language.'
    ),
    new HumanMessage(greatJobPrompt)
  ]);

  const thinkAboutResponse = await llm.invoke([
    new SystemMessage(
      'You are a spelling and grammar correction assistant. You MUST preserve the original language of the text (Hebrew/עברית). DO NOT translate text into English or any other language.'
    ),
    new HumanMessage(thinkAboutPrompt)
  ]);

  return {
    feedback: {
      greatJob: greatJobResponse.content.toString(),
      thinkAbout: thinkAboutResponse.content.toString()
    }
  };
};
