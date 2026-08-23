/**
 * What the symptom flow collects before it reaches the assistant.
 *
 * `title` comes from the category grid on AiSymptomHome, `body` from the
 * composer input (typed text plus any OCR'd or dictated content),
 * `duration` from SymptomDurationScreen, `location` from PainStatusScreen, and
 * `haveInPrevious` from PreviousHistoryCheck. The later fields are optional so
 * a partially-answered intake still type-checks.
 */
export type SymptomIntake = {
  title: string;
  body: string;
  duration: string;
  location?: string;
  haveInPrevious?: boolean;
};
