let prescriptionUrl: string | undefined;
let deliveryNotes: string | undefined;

export const checkoutSession = {
  setPrescriptionUrl(url: string) {
    prescriptionUrl = url;
  },
  getPrescriptionUrl() {
    return prescriptionUrl;
  },
  setDeliveryNotes(notes: string) {
    deliveryNotes = notes;
  },
  getDeliveryNotes() {
    return deliveryNotes;
  },
  clear() {
    prescriptionUrl = undefined;
    deliveryNotes = undefined;
  },
};
