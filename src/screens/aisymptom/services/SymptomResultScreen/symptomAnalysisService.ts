import type { SymptomIntake } from '../../data/shared/symptomIntake';
import type { ConditionSuggestion } from '../../data/SymptomResultScreen/symptomResults';
import { GeminiError, generateJson } from '../shared/geminiClient';

export { GeminiError as SymptomAnalysisError } from '../shared/geminiClient';

const SYSTEM_CONTEXT = `
You are the triage assistant inside a consumer health app. A patient has
answered a short symptom intake and you suggest what their symptoms could
plausibly be, so they can decide whether to see a doctor.

Return two to four possible explanations, ordered most likely first.

confidence is how well the intake fits that explanation, 0-100. Base it on the
answers you were given and nothing else. Spread the numbers out — do not give
several conditions the same score — and stay below 90 unless the intake is
unmistakable, because you are working from a handful of self-reported answers.

description is one or two plain sentences a non-medical reader understands:
what the condition is and how it usually presents. No jargon, no advice, no
mention of this app or of the intake questions.

severity is exactly one of Mild, Moderate or Severe — how serious this
condition typically is, not how bad the patient sounds.

triggers is a short comma-separated list of common causes, at most four items
and no trailing period, e.g. "Stress, lack of sleep".

specialty, when the schema asks for it, is the one listed specialty that
normally treats this condition. You must pick from the list — choose the
closest general fit rather than the perfect one if nothing matches exactly.

Suggest only conditions the intake actually supports. If the answers are too
thin to narrow anything down, return the broadest common explanations with low
confidence rather than inventing specifics. Never name a rare or alarming
condition on weak evidence, and never write a definitive diagnosis, a treatment
plan, or a drug recommendation.
`.trim();

function resultSchema(specialtyNames: string[]) {
  const conditionProperties: Record<string, unknown> = {
    name: {
      type: 'STRING',
      description:
        'The condition name only, e.g. "Migraine". No percentage, no commentary.',
    },
    confidence: {
      type: 'INTEGER',
      description: 'How well the intake fits this condition, 0-100.',
    },
    description: {
      type: 'STRING',
      description: 'One or two plain sentences describing the condition.',
    },
    severity: {
      type: 'STRING',
      enum: ['Mild', 'Moderate', 'Severe'],
    },
    triggers: {
      type: 'STRING',
      description: 'Comma-separated common causes, at most four.',
    },
  };

  const ordering = ['name', 'confidence', 'description', 'severity', 'triggers'];

  if (specialtyNames.length) {
    conditionProperties.specialty = {
      type: 'STRING',
      enum: specialtyNames,
      description: 'Which of these specialties treats this condition.',
    };
    ordering.splice(1, 0, 'specialty');
  }

  return {
    type: 'OBJECT',
    properties: {
      conditions: {
        type: 'ARRAY',
        description: 'Two to four possible explanations, most likely first.',
        items: {
          type: 'OBJECT',
          properties: conditionProperties,
          required: ordering,
          propertyOrdering: ordering,
        },
      },
    },
    required: ['conditions'],
    propertyOrdering: ['conditions'],
  };
}

type RawCondition = {
  name?: string;
  specialty?: string;
  confidence?: number;
  description?: string;
  severity?: string;
  triggers?: string;
};

type RawResult = {
  conditions?: RawCondition[];
};

function describeIntake(intake: SymptomIntake): string {
  const lines: string[] = [];

  if (intake.title?.trim()) {
    lines.push(`Areas the patient picked: ${intake.title.trim()}`);
  }
  if (intake.body?.trim()) {
    lines.push(`What the patient described: ${intake.body.trim()}`);
  }
  if (intake.duration?.trim()) {
    lines.push(`How long it has been going on: ${intake.duration.trim()}`);
  }
  if (intake.location?.trim()) {
    lines.push(`Where it hurts: ${intake.location.trim()}`);
  }
  if (intake.haveInPrevious !== undefined) {
    lines.push(
      `Has had this before: ${intake.haveInPrevious ? 'yes' : 'no, this is the first time'}`,
    );
  }

  return lines.length ? lines.join('\n') : 'The patient did not answer anything.';
}

function slugify(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}-${index}` : `condition-${index}`;
}

function clampConfidence(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function optional(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}

function hasMeaningfulInput(intake: SymptomIntake): boolean {
  return Boolean(
    intake.title.trim() ||
    intake.body.trim() ||
    intake.duration.trim() ||
    intake.location?.trim() ||
    intake.haveInPrevious !== undefined,
  );
}

export async function analyseSymptomIntake(
  intake: SymptomIntake,
  specialtyNames: string[] = [],
): Promise<ConditionSuggestion[]> {
  if (!hasMeaningfulInput(intake)) {
    throw new GeminiError(
      'I did not get any of your answers. Please start the check again.',
    );
  }

  const intakeBlock = `Symptom intake:\n\n${describeIntake(intake)}`;
  const prompt = specialtyNames.length
    ? `${intakeBlock}\n\nSpecialties available in this app:\n${specialtyNames.join(', ')}`
    : intakeBlock;

  const result = await generateJson<RawResult>({
    systemInstruction: SYSTEM_CONTEXT,
    parts: [{ text: prompt }],
    responseSchema: resultSchema(specialtyNames),
  });

  const conditions = (result.conditions ?? [])
    .filter(item => item?.name?.trim())
    .sort((a, b) => clampConfidence(b.confidence) - clampConfidence(a.confidence))
    .map<ConditionSuggestion>((item, index) => ({
      id: slugify(item.name!.trim(), index),
      name: item.name!.trim(),
      confidence: clampConfidence(item.confidence),
      description: optional(item.description),
      labelConfidence: index === 0,
      severity: optional(item.severity) ?? 'Unknown',
      triggers: optional(item.triggers) ?? '—',
      specialty: optional(item.specialty),
    }));

  if (!conditions.length) {
    throw new GeminiError(
      'I could not work out any likely conditions from those answers.',
    );
  }

  return conditions;
}
