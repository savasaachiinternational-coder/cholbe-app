import type {SymptomIntake} from '../screens/aisymptom/data/shared/symptomIntake';
import type {MedicationSchedule} from '../api/medications';
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
  MedicineOverview: {schedule: MedicationSchedule};
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
  /** `scheduleId` switches the form into edit mode for that schedule. */
  AddMedicationForm: {scheduleId?: string} | undefined;
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
  ReportPreview:
    | {
        fileUri?: string;
        fileUrl?: string;
        fileName?: string;
        mimeType?: string;
        reportTitle?: string;
        reportType?: 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
        provider?: string;
        reportId?: string;
        patientName?: string;
        reportDate?: string;
        startDate?: string;
        endDate?: string;
        tip?: string;
        totalPages?: number;
      }
    | undefined;
  ChooseFromReportGallery: undefined;
  SavedReport: undefined;
  CameraReport: undefined;
  ViewReportDetails: {reportId: string};
  ReportDetailsView: {
    reportId: string;
    patientName?: string;
    doctorName?: string;
    doctorSpecialty?: string;
    totalPages?: number;
  };
  ReportUploadedSuccess:
    | {
        reportId?: string;
        reportTitle?: string;
        reportType?: 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
        provider?: string;
        reportDate?: string;
        patientName?: string;
        fileName?: string;
        mimeType?: string;
        fileUrl?: string;
        tip?: string;
      }
    | undefined;
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
  //AiSymptom

  AiSymptomHome:
    | {scannedFile?: {uri: string; fileName: string; mimeType: string}}
    | undefined;
  SymptomDuration:{title: string; body: string};
  PainStatus:{intake: SymptomIntake};
  PreviousHistoryCheck:{intake: SymptomIntake};
  Ideation:{intake: SymptomIntake};
  SymptomResult:{intake: SymptomIntake};
  IdeationNext:undefined;
  AiSymptomSelected:{intake: SymptomIntake} | undefined;
  DocScanner:undefined;
};
