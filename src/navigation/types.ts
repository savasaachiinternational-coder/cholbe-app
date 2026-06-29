export type RootStackParamList = {
  Home: undefined;
  AHome: undefined;
  AOrders: undefined;
  AVendors: undefined;
  AMedicines: undefined;
  AInventory: undefined;
  AReports: undefined;
  AUsers: {initialFilter?: 'All' | 'Customers' | 'Vendors' | 'Doctors' | 'Specialties' | 'Blocked'} | undefined;
  AProfile: undefined;
  APayments: undefined;
  ADoctors: undefined;
  ADoctorEdit: {doctorId: string};
  ASpecialties: undefined;
  AAppointments: undefined;
  AReviews: undefined;
  VHome: undefined;
  VInventory: undefined;
  VAddProduct: undefined;
  VOrders: undefined;
  VPayments: undefined;
  VProfile: undefined;
  DHome: undefined;
  DAppointments: undefined;
  DPatients: undefined;
  DConsultations: undefined;
  DEditProfile:
    | {
        initialTab?:
          | 'profile'
          | 'qualifications'
          | 'experience'
          | 'instructions'
          | 'availability'
          | 'payment';
      }
    | undefined;
  DEarnings: undefined;
  DWithdraw: undefined;
  DProfile: undefined;
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
    doctorId?: string;
    viewerRole?: 'DOCTOR' | 'CUSTOMER';
  };
  WaitingRoom: {
    appointmentId: string;
    doctorName?: string;
    specialty?: string;
    viewerRole?: 'DOCTOR' | 'CUSTOMER';
  };
  ActiveVideoCall: {
    appointmentId: string;
    doctorName?: string;
    specialty?: string;
    viewerRole?: 'DOCTOR' | 'CUSTOMER';
  };
  MyProfile: undefined;
  ConsultationSummary:
    | {
        appointmentId?: string;
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
  FamilyMemberDetail: {memberId: string; memberName?: string};
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
  UploadReportDetails:
    | {
        fileUri?: string;
        fileName?: string;
        mimeType?: string;
        existingFileUrl?: string;
        existingFileName?: string;
        reportTitle?: string;
        reportType?: 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
        provider?: string;
      }
    | undefined;
  UploadReportOptionsMenu: undefined;
  ChooseFromReportGallery: undefined;
  SavedReport: undefined;
  CameraReport: undefined;
  ViewReportDetails: {reportId: string};
  ReportUploadedSuccess: undefined;
  PharmacyShop: undefined;
  PharmacyDetails: {productId: string};
  PharmacyCartOverlay: undefined;
  CartCheckoutDetails:
    | {
        addressId?: string;
        pickedLatitude?: number;
        pickedLongitude?: number;
        pickedFormattedAddress?: string;
        pickedRegionCity?: string;
        pickedRegionArea?: string;
        pickedRegionSector?: string;
        pickedUserName?: string;
        pickedUserPhone?: string;
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
        draftFormattedAddress?: string;
        draftRegionCity?: string;
        draftRegionArea?: string;
        draftRegionSector?: string;
        draftUserName?: string;
        draftUserPhone?: string;
      }
    | undefined;
  OrderCompletedDetails: {orderId: string};
  PharmacyPrescriptionMenu: undefined;
  ChooseFromPharmacyGallery: undefined;
};
