import {useEffect, useMemo, useState} from 'react';
import {doctorsApi, type Doctor} from '../../../../api/doctors';
import type {Specialty} from '../../../../api/specialties';
import type {ConditionSuggestion} from '../../data/SymptomResultScreen/symptomResults';

/** Past the second condition the grid fills up with low-confidence guesses. */
const MAX_SPECIALTIES = 2;
const MAX_DOCTORS = 4;

/** Merges the per-specialty lists, keeping the first appearance of each id. */
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
  // One specialty failing must not blank the whole section.
  const lists = await Promise.all(
    specialtyIds
      .slice(0, MAX_SPECIALTIES)
      .map(id => doctorsApi.list({specialtyId: id}).catch(() => [] as Doctor[])),
  );

  // `lists` is already in confidence order, so the top condition's doctors
  // come first without any re-sorting.
  const matched = dedupe(lists.flat());
  if (matched.length) return matched.slice(0, MAX_DOCTORS);

  // Nothing matched — a general list still beats an empty section.
  const fallback = await doctorsApi.list().catch(() => [] as Doctor[]);
  return fallback.slice(0, MAX_DOCTORS);
}

/**
 * Loads doctors for the specialties Gemini tagged the conditions with.
 *
 * Runs separately from the analysis so the condition cards render as soon as
 * they arrive instead of waiting on a second round-trip.
 */
export function useSuggestedDoctors(
  conditions: ConditionSuggestion[],
  specialties: Specialty[],
) {
  const specialtyIds = useMemo(() => {
    const byName = new Map(
      specialties.map(item => [item.name.trim().toLowerCase(), item.id]),
    );
    const ids: string[] = [];
    // Conditions arrive sorted by confidence, so the strongest match leads.
    for (const condition of conditions) {
      const key = condition.specialty?.trim().toLowerCase();
      const id = key ? byName.get(key) : undefined;
      // The schema enum should guarantee a hit, but casing and stray
      // whitespace still have to be normalised away first.
      if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
  }, [conditions, specialties]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  // Joined so a re-render with an equal-but-new array does not refetch.
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
