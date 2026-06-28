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
  BookVideoCall: {
    doctorId: string;
    doctorName?: string;
    specialty?: string;
    consultationFee?: string;
  };
  ConsultationChat: {
    doctorName?: string;
    specialty?: string;
    appointmentId?: string;
  };
  WaitingRoom: {
    appointmentId: string;
    doctorName?: string;
    specialty?: string;
  };
  ActiveVideoCall: {
    appointmentId: string;
    doctorName?: string;
    specialty?: string;
  };
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
  PharmacyDetails: {productId: string};
  PharmacyCartOverlay: undefined;
  CartCheckoutDetails:
    | {
        addressId?: string;
        pickedLatitude?: number;
        pickedLongitude?: number;
      }
    | undefined;
  CartPayment: {addressId: string; notes?: string};
  OrderTracking: {orderId: string};
  OrderListHistory: undefined;
  AddressMapPicker:
    | {
        addressId?: string;
        initialLatitude?: number;
        initialLongitude?: number;
      }
    | undefined;
  OrderCompletedDetails: {orderId: string};
  PharmacyPrescriptionMenu: undefined;
  ChooseFromPharmacyGallery: undefined;
};
