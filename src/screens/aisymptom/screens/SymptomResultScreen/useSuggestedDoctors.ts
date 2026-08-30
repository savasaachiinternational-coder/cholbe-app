import {useEffect, useMemo, useState} from 'react';
import {doctorsApi, type Doctor} from '../../../../api/doctors';
import type {Specialty} from '../../../../api/specialties';
import type {ConditionSuggestion} from '../../data/SymptomResultScreen/symptomResults';

const MAX_SPECIALTIES = 2;
const MAX_DOCTORS = 4;

function dedupe(doctors: Doctor[]): Doctor[] {
  const seen = new Set<string>();
  const merged: Doctor[] = [];
  for (const doctor of doctors) {
    if (seen.has(doctor.id)) continue;
    seen.add(doctor.id);
    merged.push(doctor);
  }
  return merged;
}

async function loadDoctors(specialtyIds: string[]): Promise<Doctor[]> {
  const lists = await Promise.all(
    specialtyIds
      .slice(0, MAX_SPECIALTIES)
      .map(id => doctorsApi.list({specialtyId: id}).catch(() => [] as Doctor[])),
  );

  const matched = dedupe(lists.flat());
  if (matched.length) return matched.slice(0, MAX_DOCTORS);

  const fallback = await doctorsApi.list().catch(() => [] as Doctor[]);
  return fallback.slice(0, MAX_DOCTORS);
}

export function useSuggestedDoctors(
  conditions: ConditionSuggestion[],
  specialties: Specialty[],
) {
  const specialtyIds = useMemo(() => {
    const byName = new Map(
      specialties.map(item => [item.name.trim().toLowerCase(), item.id]),
    );
    const ids: string[] = [];
    for (const condition of conditions) {
      const key = condition.specialty?.trim().toLowerCase();
      const id = key ? byName.get(key) : undefined;
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  }, [conditions, specialties]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const specialtyKey = specialtyIds.join(',');
  const hasConditions = conditions.length > 0;

  useEffect(() => {
    if (!hasConditions) {
      setDoctors([]);
      return;
    }

    let active = true;
    setLoading(true);

    loadDoctors(specialtyKey ? specialtyKey.split(',') : [])
      .then(list => {
        if (active) setDoctors(list);
      })
      .catch(() => {
        if (active) setDoctors([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [specialtyKey, hasConditions]);

  return {doctors, loading};
}
