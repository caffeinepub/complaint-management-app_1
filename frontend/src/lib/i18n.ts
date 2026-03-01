export type Language = 'en' | 'hi';

export interface Translations {
  pageTitle: string;
  pageSubtitle: string;
  langToggle: string;
  applicantName: string;
  applicantNamePlaceholder: string;
  fatherName: string;
  fatherNamePlaceholder: string;
  address: string;
  addressPlaceholder: string;
  mobileNumber: string;
  mobileNumberPlaceholder: string;
  complaintDetail: string;
  complaintDetailPlaceholder: string;
  attachFile: string;
  attachFileHint: string;
  submitButton: string;
  submitting: string;
  successTitle: string;
  successSubtitle: string;
  complaintNumberLabel: string;
  notificationSent: string;
  notificationDetail: string;
  submitAnother: string;
  viewAll: string;
  errors: {
    applicantName: string;
    fatherName: string;
    address: string;
    mobileNumber: string;
    mobileNumberInvalid: string;
    complaintDetail: string;
    complaintDetailShort: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    pageTitle: 'Submit a Complaint',
    pageSubtitle: 'Fill in the details below to register your complaint with PS Sadar Bazar',
    langToggle: 'हिंदी में देखें',
    applicantName: 'Applicant Name',
    applicantNamePlaceholder: 'Enter full name',
    fatherName: "Father's Name",
    fatherNamePlaceholder: "Enter father's full name",
    address: 'Address',
    addressPlaceholder: 'Enter complete address',
    mobileNumber: 'Mobile Number',
    mobileNumberPlaceholder: 'Enter 10-digit mobile number',
    complaintDetail: 'Complaint Details',
    complaintDetailPlaceholder: 'Describe your complaint in detail...',
    attachFile: 'Attach File (PDF or JPG)',
    attachFileHint: 'Supported formats: PDF, JPG. Max size: 10MB',
    submitButton: 'Submit Complaint',
    submitting: 'Submitting...',
    successTitle: 'Complaint Submitted Successfully',
    successSubtitle: 'Your complaint has been registered. Please save your complaint number for future reference.',
    complaintNumberLabel: 'Your Complaint Number',
    notificationSent: 'Notification Sent',
    notificationDetail: 'A confirmation message has been recorded in the system. An officer will be assigned to your complaint shortly.',
    submitAnother: 'Submit Another Complaint',
    viewAll: 'View All Complaints',
    errors: {
      applicantName: 'Applicant name is required',
      fatherName: "Father's name is required",
      address: 'Address is required',
      mobileNumber: 'Mobile number is required',
      mobileNumberInvalid: 'Enter a valid mobile number',
      complaintDetail: 'Complaint detail is required',
      complaintDetailShort: 'Please provide more detail (at least 20 characters)',
    },
  },
  hi: {
    pageTitle: 'शिकायत दर्ज करें',
    pageSubtitle: 'पीएस सदर बाजार में अपनी शिकायत दर्ज करने के लिए नीचे विवरण भरें',
    langToggle: 'View in English',
    applicantName: 'आवेदक का नाम',
    applicantNamePlaceholder: 'पूरा नाम दर्ज करें',
    fatherName: 'पिता का नाम',
    fatherNamePlaceholder: 'पिता का पूरा नाम दर्ज करें',
    address: 'पता',
    addressPlaceholder: 'पूरा पता दर्ज करें',
    mobileNumber: 'मोबाइल नंबर',
    mobileNumberPlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    complaintDetail: 'शिकायत विवरण',
    complaintDetailPlaceholder: 'अपनी शिकायत का विस्तार से वर्णन करें...',
    attachFile: 'फ़ाइल संलग्न करें (PDF या JPG)',
    attachFileHint: 'समर्थित प्रारूप: PDF, JPG। अधिकतम आकार: 10MB',
    submitButton: 'शिकायत दर्ज करें',
    submitting: 'दर्ज हो रहा है...',
    successTitle: 'शिकायत सफलतापूर्वक दर्ज की गई',
    successSubtitle: 'आपकी शिकायत दर्ज कर ली गई है। भविष्य के संदर्भ के लिए अपना शिकायत नंबर सुरक्षित रखें।',
    complaintNumberLabel: 'आपका शिकायत नंबर',
    notificationSent: 'सूचना भेजी गई',
    notificationDetail: 'सिस्टम में एक पुष्टिकरण संदेश दर्ज किया गया है। जल्द ही एक अधिकारी आपकी शिकायत के लिए नियुक्त किया जाएगा।',
    submitAnother: 'एक और शिकायत दर्ज करें',
    viewAll: 'सभी शिकायतें देखें',
    errors: {
      applicantName: 'आवेदक का नाम आवश्यक है',
      fatherName: 'पिता का नाम आवश्यक है',
      address: 'पता आवश्यक है',
      mobileNumber: 'मोबाइल नंबर आवश्यक है',
      mobileNumberInvalid: 'एक वैध मोबाइल नंबर दर्ज करें',
      complaintDetail: 'शिकायत विवरण आवश्यक है',
      complaintDetailShort: 'कृपया अधिक विवरण प्रदान करें (कम से कम 20 अक्षर)',
    },
  },
};
