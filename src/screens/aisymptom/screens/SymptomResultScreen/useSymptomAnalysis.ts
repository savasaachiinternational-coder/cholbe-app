import {useCallback, useEffect, useState} from 'react';
import {specialtiesApi, type Specialty} from '../../../../api/specialties';
import type {SymptomIntake} from '../../data/shared/symptomIntake';
import type {ConditionSuggestion} from '../../data/SymptomResultScreen/symptomResults';
import {analyseSymptomIntake} from '../../services/SymptomResultScreen/symptomAnalysisService';

type State = {
  status: 'loading' | 'ready' | 'error';
  conditions: ConditionSuggestion[];
  specialties: Specialty[];
  errorMessage: string;
};

const INITIAL: State = {
  status: 'loading',
  conditions: [],
  specialties: [],
  errorMessage: '',
};

function errorText(err: unknown) {
  return err instanceof Error && err.message
    ? err.message
    : 'Could not analyse your answers.';
}

export function useSymptomAnalysis(intake: SymptomIntake) {
  const [state, setState] = useState<State>(INITIAL);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState(INITIAL);

    const run = async () => {
      const specialties = await specialtiesApi.list().catch(() => [] as Specialty[]);
      const conditions = await analyseSymptomIntake(
        intake,
        specialties.map(item => item.name),
      );
      return {conditions, specialties};
    };

    run()
      .then(({conditions, specialties}) => {
        if (active) {
          setState({status: 'ready', conditions, specialties, errorMessage: ''});
        }
      })
      .catch(err => {
        if (__DEV__) {
          console.warn('[symptomAnalysis] analysis failed', err);
        }
        if (active) {
          setState({
            status: 'error',
            conditions: [],
            specialties: [],
            errorMessage: errorText(err),
          });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const retry = useCallback(() => setAttempt(value => value + 1), []);

  return {...state, retry};
}
