export type RootStackParamList = {
  Home: undefined;
  MedicineList: undefined;
  ReportsList: undefined;
  DoctorList: undefined;
  BookVideoCall:
    | {
        doctorName?: string;
        specialty?: string;
        consultationFee?: string;
      }
    | undefined;
  ConsultationChat:
    | {
        doctorName?: string;
        specialty?: string;
      }
    | undefined;
  WaitingRoom:
    | {
        doctorName?: string;
        specialty?: string;
      }
    | undefined;
  ActiveVideoCall:
    | {
        doctorName?: string;
        specialty?: string;
      }
    | undefined;
  MyProfile: undefined;
  ConsultationSummary:
    | {
        doctorName?: string;
        specialty?: string;
      }
    | undefined;
  MyAppointment: undefined;
  Notifications: undefined;
  Reminders: undefined;
  Alerts: undefined;
  EditProfile: undefined;
  AddFamilyMember: undefined;
  Deliveries: undefined;
  AddMedication: undefined;
  AddMedicationForm: undefined;
  UploadReport: undefined;
  AddFromCamera: undefined;
  ChooseFromGallery: undefined;
  SavedPrescription: undefined;
  ReviewDetails: undefined;
  ReviewMedication: undefined;
  AddReportMenu: undefined;
  UploadReportDetails: undefined;
  UploadReportOptionsMenu: undefined;
  ChooseFromReportGallery: undefined;
  SavedReport: undefined;
  CameraReport: undefined;
  ViewReportDetails: undefined;
  ReportUploadedSuccess: undefined;
  PharmacyShop: undefined;
  PharmacyCartOverlay: undefined;
  CartCheckoutDetails: undefined;
  OrderTracking: undefined;
  OrderListHistory: undefined;
  AddressMapPicker: undefined;
  OrderCompletedDetails: undefined;
  PharmacyPrescriptionMenu: undefined;
  ChooseFromPharmacyGallery: undefined;
};
