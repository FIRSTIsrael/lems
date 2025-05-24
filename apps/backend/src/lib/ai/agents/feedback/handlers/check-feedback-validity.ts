import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { GraphAnnotation } from '../types';
import { llm } from '../../../llm';

export const checkFeedbackValidity = async (state: typeof GraphAnnotation.State) => {
  const analysisPrompt = `
    Analyze the following feedback for a FIRST LEGO League team rubric and determine if it's problematic.
    Problematic feedback is defined as:
    1. Empty or extremely short feedback that provides no real insight (fewer than 5 meaningful words)
    2. "Great Job" section that contains primarily negative critiques (misplaced feedback)
    3. "Think About" section that contains primarily praise (misplaced feedback)
    4. Content that is unclear, incoherent, or cannot be meaningfully improved
    
    Great Job Feedback: ${state.feedback.greatJob || '(empty)'}
    Think About Feedback: ${state.feedback.thinkAbout || '(empty)'}
    
    First analyze the sentiment and content of each feedback section.
    Then determine if either section is problematic based on the criteria above.
    Return a JSON object with { "isProblematic": boolean, "reason": string if problematic }
    `;

  const response = await llm.invoke([
    new SystemMessage(
      'You are a feedback quality analysis assistant. Analyze feedback critically and objectively.'
    ),
    new HumanMessage(analysisPrompt),
    new SystemMessage(
      "You MUST return a JSON object with the keys 'isProblematic' and 'reason' if applicable. \
        Do not include any other text or explanations. The value of \"reason\" should be a string explaining the problem."
    )
  ]);

  const content = response.content.toString();
  let result: { isProblematic: boolean; reason?: string };

  try {
    const jsonMatch = content.match(/{[\s\S]*}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid JSON format in LLM response');
    }
  } catch (error) {
    console.error('Error parsing feedback analysis:', error);
    result = { isProblematic: true, reason: 'Invalid response format from LLM' };
  }

  return {
    isValid: result.isProblematic,
    error: result.reason || ''
  };
};
