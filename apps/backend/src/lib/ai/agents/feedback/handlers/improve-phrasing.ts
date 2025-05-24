import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { GraphAnnotation } from '../types';
import { rubricsSchemas } from '@lems/season';
import { llm } from '../../../llm';

export const improvePhrasing = async (state: typeof GraphAnnotation.State) => {
  const { rubric, feedback } = state;

  const systemPrompt = `You are an AI assistant designed to help improve feedback on team rubrics for a FIRST LEGO League competition.
  Your goal is to enhance feedback clarity while preserving the original feedback's intent and emotion.

  The feedback consists of two parts:
  1. "greatJob" - Positive feedback highlighting what the team did well
  2. "thinkAbout" - Constructive feedback suggesting areas for improvement

  If the feedback is already good, return it as is without any changes.
  If the feedback is in Hebrew (עברית), you must maintain it in Hebrew. Do NOT translate to any other language.
  `;

  const context = `
    Rubric Category: ${rubric.category}
    Rubric Scores: ${JSON.stringify(rubric.values, null, 2)}  
    
    Localized rubric: ${JSON.stringify(rubricsSchemas[rubric.category], null, 2)}`;

  const greatJobPrompt = `
    Improve the phrasing of the following "Great Job" feedback to be clearer and more concise, while preserving the original meaning and emotion. 
    Only enhance phrasing that needs improvement; preserve good parts. 
    Use rubric terminology and avoid generic phrases.
    
    Context:
    ${context}
    
    Original Feedback (with grammar and spelling fixed):
    ${feedback.greatJob}
    `;

  const thinkAboutPrompt = `
    Improve the phrasing of the following "Think About" feedback to be clearer, more constructive, and more concise, 
    while preserving the original meaning and emotion. Only enhance phrasing that needs improvement; preserve good parts. 
    Use rubric terminology and avoid generic phrases.
    
    Context:
    ${context}
    
    Original Feedback (with grammar and spelling fixed):
    ${feedback.thinkAbout}
    `;

  const greatJobResponse = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(greatJobPrompt)
  ]);

  const thinkAboutResponse = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(thinkAboutPrompt)
  ]);

  return {
    feedback: {
      greatJob: greatJobResponse.content.toString(),
      thinkAbout: thinkAboutResponse.content.toString()
    }
  };
};
