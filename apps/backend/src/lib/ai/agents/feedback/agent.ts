import { z } from 'zod';
import { START, StateGraph, END } from '@langchain/langgraph';
import { GraphAnnotation, RubricSchema } from './types';
import { checkFeedbackValidity } from './handlers/check-feedback-validity';
import { improveSpellingAndGrammar } from './handlers/improve-spelling-and-grammar';
import { improvePhrasing } from './handlers/improve-phrasing';

const graph = new StateGraph(GraphAnnotation)
  .addNode('checkFeedbackValidity', checkFeedbackValidity)
  .addNode('improveSpellingAndGrammar', improveSpellingAndGrammar)
  .addNode('improvePhrasing', improvePhrasing);

const continueIfValid = (state: typeof GraphAnnotation.State) => {
  return state.isValid ? 'improveSpellingAndGrammar' : END;
};

graph
  .addEdge(START, 'checkFeedbackValidity')
  .addConditionalEdges('checkFeedbackValidity', continueIfValid)
  .addEdge('improveSpellingAndGrammar', 'improvePhrasing')
  .addEdge('improvePhrasing', END);

const workflow = graph.compile();

type AgentInput = z.infer<typeof RubricSchema>;
export async function enhanceFeedback(rubric: AgentInput) {
  try {
    const result = await workflow.invoke(
      {
        rubric,
        feedback: rubric.feedback || { greatJob: '', thinkAbout: '' },
        isValid: true,
        error: ''
      },
      {
        runName: 'enhance-feedback'
      }
    );

    return result;
  } catch (error) {
    console.error('Error enhancing feedback:', error);
  }
}
