import { createMiddleware } from 'langchain';
import { AIMessage, ToolMessage } from '@langchain/core/messages';

type FormulateAnswerResult =
  { ok: true; text: string } | { ok: false; reason: string; fallbackText: string };

/**
 * Without this, formulate_answer's ToolMessage goes back through another full model call
 * whose only job is to relay it verbatim - that extra roundtrip (plus reasoning overhead)
 * is what causes the delay between the tool succeeding and the reply actually being sent.
 * `beforeModel` + `jumpTo: "end"` is the officially wired short-circuit mechanism (same one
 * `toolCallLimitMiddleware` uses); a `wrapToolCall`-returned `Command` does NOT skip the
 * static tools -> model edge in this graph, so don't go back to that approach.
 */
export const endOnFormulateAnswerMiddleware = createMiddleware({
  name: 'EndOnFormulateAnswerMiddleware',
  beforeModel: {
    canJumpTo: ['end'],
    hook: state => {
      const lastMessage = state.messages.at(-1);
      if (!ToolMessage.isInstance(lastMessage) || lastMessage.name !== 'formulate_answer') return;

      const parsed = JSON.parse(lastMessage.content as string) as FormulateAnswerResult;
      const finalText = parsed.ok ? parsed.text : parsed.fallbackText;

      return { jumpTo: 'end' as const, messages: [new AIMessage(finalText)] };
    }
  }
});
