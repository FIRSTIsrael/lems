import { tool } from 'langchain';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { ANSWER_STYLE_GUIDE_HE } from '../answer-style.he';
import { getGlossaryTerm, getMission, getRule, getUpdate } from '../corpus';

// Separate, more "creative" model from the main agent's tool-calling model - this call only
// rephrases an already-decided verdict, it never reasons about rules.
const styleModel = new ChatOpenAI({
  model: 'gpt-5.6-terra',

  reasoning: {
    effort: 'none',
    summary: 'concise'
  },

  temperature: 0.6,
  maxTokens: undefined,
  timeout: undefined
});

const STYLE_SYSTEM_PROMPT = `You are rephrasing an already-decided FLL Challenge rules verdict into
the exact voice of an Israeli FLL Head Referee (שופט זירה ראשי), following the style guide below.
You never invent facts, rules, quotes, or scores - you only restructure the given verdict, quotes,
and reasoning into the required tone and format.

Rules:
- Reproduce every string given in "quotes" verbatim and unmodified, wrapped in quotation marks.
- You may paraphrase and restructure "reasoning" freely to match the style guide's explanation style.
- Never add a greeting, sign-off, team reference, or child name.
- Never invent a rule, quote, mission id, or score not present in the input.
- Output only the final answer text in Hebrew - no preamble, no meta-commentary.

${ANSWER_STYLE_GUIDE_HE}`;

const quoteSchema = z.object({
  source: z.string().min(1),
  text: z.string().min(1)
});

type Quote = z.infer<typeof quoteSchema>;

const sourceRefSchema = z.object({
  type: z.enum(['rule', 'mission', 'update', 'glossary']),
  id: z.string().min(1)
});

// Resolves a { type, id } ref to its authoritative verbatim text straight from the corpus, so the
// styling pass never depends on the main agent re-typing (and possibly mangling) what it already read.
function resolveSourceRef({ type, id }: z.infer<typeof sourceRefSchema>): Quote {
  switch (type) {
    case 'rule': {
      const rule = getRule(id);
      if (!rule) throw new Error(`Unknown rule id: ${id}`);
      return {
        source: `כלל ${rule.ruleNumber}${rule.section ? ` (${rule.section.titleHe})` : ''}`,
        text: rule.text
      };
    }
    case 'mission': {
      const mission = getMission(id);
      if (!mission) throw new Error(`Unknown mission id: ${id}`);
      return { source: `משימה ${mission.nameHe}`, text: mission.scoringText };
    }
    case 'update': {
      const update = getUpdate(id);
      if (!update) throw new Error(`Unknown update id: ${id}`);
      return { source: `עדכון: ${update.name}`, text: update.contents };
    }
    case 'glossary': {
      const term = getGlossaryTerm(id);
      if (!term) throw new Error(`Unknown glossary term id: ${id}`);
      return { source: `מונח: ${term.termHe}`, text: term.definition };
    }
  }
}

// Deterministic, non-AI fallback used whenever the styling pass fails to preserve a quote verbatim.
function buildFallback(verdict: string, quotes: Quote[], reasoning: string): string {
  const quotesBlock = quotes.map(q => `**${q.source}**: "${q.text}"`).join('\n');
  return `תשובה קצרה: ${verdict}\n\nתשובה מפורטת:\n${reasoning}${quotesBlock ? `\n\n${quotesBlock}` : ''}`;
}

export const formulateAnswer = tool(
  async ({ verdict, quotes, sources, reasoning }) => {
    const resolvedQuotes = [...quotes, ...sources.map(resolveSourceRef)];
    const quotesBlock = resolvedQuotes.map(q => `[${q.source}] "${q.text}"`).join('\n');
    const response = await styleModel.invoke([
      { role: 'system', content: STYLE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `verdict: ${verdict}\n\nquotes:\n${quotesBlock || '(none)'}\n\nreasoning: ${reasoning}`
      }
    ]);
    const text = response.text;

    const missingQuote = resolvedQuotes.find(quote => !text.includes(quote.text));
    if (missingQuote) {
      return {
        ok: false as const,
        reason: 'quote_mismatch' as const,
        fallbackText: buildFallback(verdict, resolvedQuotes, reasoning)
      };
    }

    return { ok: true as const, text };
  },
  {
    name: 'formulate_answer',
    description:
      'Call exactly once, as the final action of a turn, once you have a decisive verdict and its ' +
      'verbatim backing quotes (or none, for a deferral). Rephrases the draft into the required Head ' +
      'Referee tone - never call this before the verdict is settled. Pass: verdict (the short decisive ' +
      'answer); sources (preferred way to cite a rule/mission/update/glossary entry you already read via ' +
      'read_rule/read_mission/read_update/read_glossary_term - pass its id and the tool fetches the exact ' +
      'verbatim text itself, so nothing is lost or mistyped); quotes (verbatim excerpts for anything not ' +
      'covered by sources, e.g. a snippet from field setup/challenge kit/table instructions/gracious ' +
      'professionalism, or a fixed referral such as the flltech@firstisrael.org.il email address); and ' +
      'reasoning (how it all leads to the verdict, may be paraphrased). Returns { ok: true, text } to ' +
      'relay verbatim as your final reply, or { ok: false, fallbackText } if a quote could not be ' +
      'reproduced faithfully - relay fallbackText verbatim in that case instead.',
    schema: z.object({
      verdict: z.string().min(1),
      quotes: z.array(quoteSchema).default([]),
      sources: z.array(sourceRefSchema).default([]),
      reasoning: z.string().min(1)
    })
  }
);
