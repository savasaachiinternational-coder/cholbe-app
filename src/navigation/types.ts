export type RootStackParamList = {
  Home: undefined;
  AHome: undefined;
  AOrders: undefined;
  AVendors: undefined;
  AMedicines: undefined;
  AInventory: undefined;
  AReports: undefined;
  AUsers: undefined;
  AProfile: undefined;
  APayments: undefined;
  VHome: undefined;
  VInventory: undefined;
  VAddProduct: undefined;
  VOrders: undefined;
  VPayments: undefined;
  VProfile: undefined;
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
  PharmacyDetails:
    | {
        name?: string;
        subtitle?: string;
        imageUrl?: string;
        price?: string;
        oldPrice?: string;
      }
    | undefined;
  PharmacyCartOverlay: undefined;
  CartCheckoutDetails: undefined;
  CartPayment: undefined;
  OrderTracking: undefined;
  OrderListHistory: undefined;
  AddressMapPicker: undefined;
  OrderCompletedDetails: undefined;
  PharmacyPrescriptionMenu: undefined;
  ChooseFromPharmacyGallery: undefined;
};
