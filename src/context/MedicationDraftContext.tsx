import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from 'react';
import {uploadFile} from '../api/uploads';
import {prescriptionsApi} from '../api/prescriptions';
import {medicationSchedulesApi} from '../api/medications';
import {
  createDefaultMedicationDraft,
  draftToSchedulePayload,
  type MedicationDraft,
} from '../utils/medicationDraft';

type MedicationDraftContextValue = {
  draft: MedicationDraft;
  setDraft: (draft: MedicationDraft) => void;
  patchDraft: (patch: Partial<MedicationDraft>) => void;
  resetDraft: (overrides?: Partial<MedicationDraft>) => void;
  saveSchedule: () => Promise<void>;
  uploadAndScan: (
    uri: string,
    fileName: string,
    mimeType: string,
    source: 'camera' | 'gallery',
  ) => Promise<void>;
  loadPrescriptionDraft: (prescriptionId: string) => Promise<void>;
};

const MedicationDraftContext = createContext<MedicationDraftContextValue | null>(
  null,
);

export function MedicationDraftProvider({children}: {children: ReactNode}) {
  const [draft, setDraftState] = useState<MedicationDraft>(
    createDefaultMedicationDraft(),
  );

  const setDraft = useCallback((value: MedicationDraft) => {
    setDraftState(value);
  }, []);

  const patchDraft = useCallback((patch: Partial<MedicationDraft>) => {
    setDraftState(current => ({...current, ...patch}));
  }, []);

  const resetDraft = useCallback((overrides?: Partial<MedicationDraft>) => {
    setDraftState(createDefaultMedicationDraft(overrides));
  }, []);

  const saveSchedule = useCallback(async () => {
    await medicationSchedulesApi.create(draftToSchedulePayload(draft));
  }, [draft]);

  const uploadAndScan = useCallback(
    async (
      uri: string,
      fileName: string,
      mimeType: string,
      source: 'camera' | 'gallery',
    ) => {
      const upload = await uploadFile(
        '/uploads/prescription',
        uri,
        fileName,
        mimeType,
      );
      const result = await prescriptionsApi.scan({
        fileUrl: upload.fileUrl,
        fileName: upload.fileName,
        source,
      });
      setDraftState({
        ...createDefaultMedicationDraft(),
        ...result.draft,
        source,
      });
    },
    [],
  );

  const loadPrescriptionDraft = useCallback(async (prescriptionId: string) => {
    const draft = await prescriptionsApi.getDraft(prescriptionId);
    setDraftState(createDefaultMedicationDraft({...draft, source: 'saved'}));
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      patchDraft,
      resetDraft,
      saveSchedule,
      uploadAndScan,
      loadPrescriptionDraft,
    }),
    [
      draft,
      setDraft,
      patchDraft,
      resetDraft,
      saveSchedule,
      uploadAndScan,
      loadPrescriptionDraft,
    ],
  );

  return (
    <MedicationDraftContext.Provider value={value}>
      {children}
    </MedicationDraftContext.Provider>
  );
}

export function useMedicationDraft() {
  const context = useContext(MedicationDraftContext);
  if (!context) {
    throw new Error('useMedicationDraft must be used within MedicationDraftProvider');
  }
  return context;
}
