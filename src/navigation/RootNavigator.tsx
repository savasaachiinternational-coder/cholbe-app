import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/home/HomeScreen';
import {MedicineListScreen} from '../screens/home/MedicineListScreen';
import {BookVideoCallScreen} from '../screens/home/BookVideoCallScreen';
import {ConsultationChatScreen} from '../screens/home/ConsultationChatScreen';
import {WaitingRoomScreen} from '../screens/home/WaitingRoomScreen';
import {ActiveVideoCallScreen} from '../screens/home/ActiveVideoCallScreen';
import {MyProfileScreen} from '../screens/home/MyProfileScreen';
import {ConsultationSummaryScreen} from '../screens/home/ConsultationSummaryScreen';
import {MyAppointmentScreen} from '../screens/home/MyAppointmentScreen';
import {NotificationsScreen} from '../screens/home/NotificationsScreen';
import {RemindersScreen} from '../screens/home/RemindersScreen';
import {AlertsScreen} from '../screens/home/AlertsScreen';
import {EditProfileScreen} from '../screens/home/EditProfileScreen';
import {AddFamilyMemberScreen} from '../screens/home/AddFamilyMemberScreen';
import {DeliveriesScreen} from '../screens/home/DeliveriesScreen';
import {AddMedicationScreen} from '../screens/home/AddMedicationScreen';
import {AddMedicationFormScreen} from '../screens/home/AddMedicationFormScreen';
import {UploadReportScreen} from '../screens/home/UploadReportScreen';
import {AddFromCameraScreen} from '../screens/home/AddFromCameraScreen';
import {ChooseFromGalleryScreen} from '../screens/home/ChooseFromGalleryScreen';
import {SavedPrescriptionScreen} from '../screens/home/SavedPrescriptionScreen';
import {ReviewDetailsScreen} from '../screens/home/ReviewDetailsScreen';
import {ReviewMedicationScreen} from '../screens/home/ReviewMedicationScreen';
import {AddReportMenuScreen} from '../screens/home/AddReportMenuScreen';
import {UploadReportDetailsScreen} from '../screens/home/UploadReportDetailsScreen';
import {UploadReportOptionsMenuScreen} from '../screens/home/UploadReportOptionsMenuScreen';
import {ChooseFromReportGalleryScreen} from '../screens/home/ChooseFromReportGalleryScreen';
import {SavedReportScreen} from '../screens/home/SavedReportScreen';
import {CameraReportScreen} from '../screens/home/CameraReportScreen';
import {ViewReportDetailsScreen} from '../screens/home/ViewReportDetailsScreen';
import {ReportUploadedSuccessScreen} from '../screens/home/ReportUploadedSuccessScreen';
import {PharmacyShopScreen} from '../screens/home/PharmacyShopScreen';
import {PharmacyCartOverlayScreen} from '../screens/home/PharmacyCartOverlayScreen';
import {CartCheckoutDetailsScreen} from '../screens/home/CartCheckoutDetailsScreen';
import {OrderTrackingScreen} from '../screens/home/OrderTrackingScreen';
import {OrderListHistoryScreen} from '../screens/home/OrderListHistoryScreen';
import {AddressMapPickerScreen} from '../screens/home/AddressMapPickerScreen';
import {OrderCompletedDetailsScreen} from '../screens/home/OrderCompletedDetailsScreen';
import {PharmacyPrescriptionMenuScreen} from '../screens/home/PharmacyPrescriptionMenuScreen';
import {ChooseFromPharmacyGalleryScreen} from '../screens/home/ChooseFromPharmacyGalleryScreen';
import {DoctorListScreen} from '../screens/home/DoctorListScreen';
import {ReportsListScreen} from '../screens/home/ReportsListScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="MedicineList"
        component={MedicineListScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ReportsList"
        component={ReportsListScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="BookVideoCall"
        component={BookVideoCallScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ConsultationChat"
        component={ConsultationChatScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="WaitingRoom"
        component={WaitingRoomScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ActiveVideoCall"
        component={ActiveVideoCallScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ConsultationSummary"
        component={ConsultationSummaryScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="MyAppointment"
        component={MyAppointmentScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddFamilyMember"
        component={AddFamilyMemberScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddMedicationForm"
        component={AddMedicationFormScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="UploadReport"
        component={UploadReportScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddFromCamera"
        component={AddFromCameraScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ChooseFromGallery"
        component={ChooseFromGalleryScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="SavedPrescription"
        component={SavedPrescriptionScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ReviewDetails"
        component={ReviewDetailsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ReviewMedication"
        component={ReviewMedicationScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddReportMenu"
        component={AddReportMenuScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="UploadReportDetails"
        component={UploadReportDetailsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="UploadReportOptionsMenu"
        component={UploadReportOptionsMenuScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ChooseFromReportGallery"
        component={ChooseFromReportGalleryScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="SavedReport"
        component={SavedReportScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="CameraReport"
        component={CameraReportScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ViewReportDetails"
        component={ViewReportDetailsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ReportUploadedSuccess"
        component={ReportUploadedSuccessScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="PharmacyShop"
        component={PharmacyShopScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="PharmacyCartOverlay"
        component={PharmacyCartOverlayScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="CartCheckoutDetails"
        component={CartCheckoutDetailsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="OrderListHistory"
        component={OrderListHistoryScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="AddressMapPicker"
        component={AddressMapPickerScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="OrderCompletedDetails"
        component={OrderCompletedDetailsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="PharmacyPrescriptionMenu"
        component={PharmacyPrescriptionMenuScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ChooseFromPharmacyGallery"
        component={ChooseFromPharmacyGalleryScreen}
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
