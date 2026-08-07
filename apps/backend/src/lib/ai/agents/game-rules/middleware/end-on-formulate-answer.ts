import { createMiddleware } from 'langchain';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { Command, END, isCommand } from '@langchain/langgraph';

type FormulateAnswerResult =
  | { ok: true; text: string }
  | { ok: false; reason: string; fallbackText: string };

/**
 * Without this, formulate_answer's ToolMessage goes back through another full model
 * call whose only job is to relay it verbatim - that extra roundtrip (plus reasoning
 * overhead) is what causes the multi-second gap between the tool succeeding and the
 * reply actually being sent. This ends the turn directly with the tool's own output.
 */
export const endOnFormulateAnswerMiddleware = createMiddleware({
  name: 'EndOnFormulateAnswerMiddleware',
  wrapToolCall: async (request, handler) => {
    try {
      const result = await handler(request);
      if (
        request.toolCall.name !== 'formulate_answer' ||
        isCommand(result) ||
        !ToolMessage.isInstance(result)
      ) {
        return result;
      }

      const parsed = JSON.parse(result.content as string) as FormulateAnswerResult;
      const finalText = parsed.ok ? parsed.text : parsed.fallbackText;

      return new Command({
        goto: END,
        update: { messages: [result, new AIMessage(finalText)] }
      });
    } catch (error) {
      // Match the ToolNode's default error handling, which wrapToolCall's presence would
      // otherwise bypass, so tool failures still come back as a retryable ToolMessage.
      return new ToolMessage({
        name: request.toolCall.name,
        content: `${error}\n Please fix your mistakes.`,
        tool_call_id: request.toolCall.id ?? ''
      });
    }
  }
});
