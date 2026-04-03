export interface Translations {
  nav: {
    howItWorks: string;
    supportedPlatforms: string;
    features: string;
    protect: string;
    takedown: string;
    investigate: string;
    resources: string;
    dashboard: string;
    startVerification: string;
    protectImages: string;
    verify: string;
  };
  hero: {
    badge: string;
    heading1: string;
    heading2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust1: string;
    trust2: string;
    trust3: string;
    stat1Label: string;
    stat2Label: string;
    stat3Label: string;
  };
  howItWorks: {
    eyebrow: string;
    heading: string;
    subheading: string;
    step1Title: string;
    step1Desc: string;
    step1Detail: string;
    step1Aside: string;
    step2Title: string;
    step2Desc: string;
    step2Detail: string;
    step2Aside: string;
    step3Title: string;
    step3Desc: string;
    step3Detail: string;
    step3Aside: string;
  };
  common: {
    upload: string;
    download: string;
    verify: string;
    analyze: string;
    report: string;
    caseId: string;
    verdict: string;
    submit: string;
    back: string;
    next: string;
    close: string;
    loading: string;
    authentic: string;
    manipulated: string;
    suspicious: string;
    error: string;
    success: string;
  };
  footer: {
    tagline: string;
    rights: string;
    privacyPolicy: string;
  };
  start: {
    breadcrumb: string;
    eyebrow: string;
    heading: string;
    subheading: string;
    step1: string;
    step1Sub: string;
    step2: string;
    step2Sub: string;
    step3: string;
    step3Sub: string;
    deepfakeTitle: string;
    deepfakeDesc: string;
    nciiTitle: string;
    nciiDesc: string;
    screenshotTitle: string;
    screenshotDesc: string;
    sharedInfraTitle: string;
    sharedInfraDesc: string;
  };
  upload: {
    breadcrumb: string;
    heading: string;
    subheading: string;
    dropzoneLabel: string;
    dropzoneHint: string;
    analyzeButton: string;
    supportingLabel: string;
  };
  report: {
    forensicReport: string;
    confidential: string;
    copyHash: string;
    copied: string;
    exportPdf: string;
    loading: string;
    loadingDetail: string;
    reportUnavailable: string;
    newInvestigation: string;
    printReport: string;
    disclaimer: string;
    askAnalyst: string;
    stepAnalysis: string;
    stepDistribution: string;
    stepTakedown: string;
    inProgress: string;
    completed: string;
    step: string;
    caseRef: string;
    dateFiled: string;
    sourcePlatform: string;
    issueType: string;
    reportType: string;
    anonymous: string;
    named: string;
    victimStatement: string;
    forensicVerdict: string;
    riskScore: string;
    likelyManipulated: string;
    highSuspicion: string;
    inconclusive: string;
    likelyAuthentic: string;
    manipulatedDesc: string;
    highDesc: string;
    inconclusiveDesc: string;
    authenticDesc: string;
    submittedEvidence: string;
    analysisSummary: string;
    neuralModel: string;
    forensicSignals: string;
    signals: string;
    flagged: string;
    signal: string;
    result: string;
    status: string;
    flag: string;
    pass: string;
    distributionIntel: string;
    distributionDesc: string;
    continueStep2: string;
    traceDistribution: string;
    traceDistributionDesc: string;
    continueStep3: string;
    executeTakedown: string;
    executeTakedownDesc: string;
    takedownResponse: string;
    takedownDesc: string;
    investigationComplete: string;
    caseSealed: string;
    caseSealedDesc: string;
    deepfakeForensics: string;
    loggedScored: string;
    distributionTrace: string;
    networksScanned: string;
    takedownRequest: string;
    readyToSubmit: string;
    startNew: string;
    exportReport: string;
    evidenceMetadata: string;
    evidenceTimeline: string;
    chainOfCustody: string;
    c2paCredentials: string;
    supportingEvidence: string;
    forensicMetadata: string;
    noForensicPayload: string;
    runningAnalysis: string;
    refreshPage: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    nav: {
      howItWorks: "HOW IT WORKS",
      supportedPlatforms: "SUPPORTED PLATFORMS",
      features: "FEATURES",
      protect: "PROTECT",
      takedown: "TAKEDOWN",
      investigate: "REMOVE CONTENT",
      resources: "RESOURCES",
      dashboard: "MY CASES",
      startVerification: "Analyze an Image",
      protectImages: "Protect Images",
      verify: "Analyze",
    },
    hero: {
      badge: "Free · Private · No account required",
      heading1: "Found a fake image of you?",
      heading2: "Get proof. Get it removed.",
      body: "Upload the image. We run a full forensic analysis in under 60 seconds and give you a certified evidence report — with the exact removal contact for wherever it's hosted.",
      ctaPrimary: "Analyze an Image",
      ctaSecondary: "See how it works",
      trust1: "No account required",
      trust2: "Your image is never stored",
      trust3: "100% private by default",
      stat1Label: "Detection accuracy",
      stat2Label: "Mean analysis time",
      stat3Label: "Cryptographic hash",
    },
    howItWorks: {
      eyebrow: "How it works",
      heading: "From image to evidence\nin three steps.",
      subheading: "No account. No install. Results in under a minute.",
      step1Title: "Upload the image",
      step1Desc: "Any JPEG, PNG, or WebP. No account needed. The file is SHA-256 hashed on receipt — your original is never retained after analysis.",
      step1Detail: "SHA-256 hash on upload",
      step1Aside: "We never store your image",
      step2Title: "Seven-layer forensic analysis",
      step2Desc: "Error-level analysis, EXIF integrity check, GAN artifact detection, facial landmark distortion, clone region mapping, noise patterns, and compression fingerprinting — run concurrently.",
      step2Detail: "~30–60 seconds",
      step2Aside: "All layers run in parallel",
      step3Title: "Download a signed evidence report",
      step3Desc: "A structured PDF with per-layer confidence scores, a cryptographic case ID, and a SHA-256 image hash. Formatted to meet platform takedown and legal filing requirements.",
      step3Detail: "PDF · case ID · signature",
      step3Aside: "Accepted by major platforms",
    },
    common: {
      upload: "Upload",
      download: "Download",
      verify: "Verify",
      analyze: "Analyze",
      report: "Report",
      caseId: "Case ID",
      verdict: "Verdict",
      submit: "Submit",
      back: "Back",
      next: "Next",
      close: "Close",
      loading: "Loading...",
      authentic: "Authentic",
      manipulated: "Manipulated",
      suspicious: "Suspicious",
      error: "Error",
      success: "Success",
    },
    footer: {
      tagline: "Securing media authenticity.",
      rights: "All rights reserved.",
      privacyPolicy: "Privacy Policy",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report",
      confidential: "Confidential",
      copyHash: "Copy hash",
      copied: "Copied",
      exportPdf: "Export PDF",
      loading: "Loading forensic report",
      loadingDetail: "Decrypting case data...",
      reportUnavailable: "Report unavailable",
      newInvestigation: "Start a new investigation",
      printReport: "Print Report",
      disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.",
      askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis",
      stepDistribution: "Distribution Trace",
      stepTakedown: "Takedown & Response",
      inProgress: "In progress",
      completed: "Completed",
      step: "Step",
      caseRef: "Case Reference",
      dateFiled: "Date Filed",
      sourcePlatform: "Source Platform",
      issueType: "Issue Type",
      reportType: "Report Type",
      anonymous: "Anonymous",
      named: "Named",
      victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict",
      riskScore: "risk score",
      likelyManipulated: "Likely Manipulated",
      highSuspicion: "High Suspicion",
      inconclusive: "Inconclusive",
      likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.",
      highDesc: "Multiple manipulation signals flagged — manual expert review advised.",
      inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.",
      authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence",
      analysisSummary: "Analysis Summary",
      neuralModel: "Neural Model Evidence",
      forensicSignals: "Forensic Signals",
      signals: "signals",
      flagged: "flagged",
      signal: "Signal",
      result: "Result",
      status: "Status",
      flag: "Flag",
      pass: "Pass",
      distributionIntel: "Distribution Intelligence",
      distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.",
      continueStep2: "Continue to Step 02",
      traceDistribution: "Trace Distribution Network",
      traceDistributionDesc: "Scan where this content is spreading across the web",
      continueStep3: "Continue to Step 03",
      executeTakedown: "Execute Takedown & Response",
      executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response",
      takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete",
      caseSealed: "is sealed",
      caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics",
      loggedScored: "Logged & scored",
      distributionTrace: "Distribution trace",
      networksScanned: "Networks scanned",
      takedownRequest: "Takedown request",
      readyToSubmit: "Ready to submit",
      startNew: "Start new investigation",
      exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata",
      evidenceTimeline: "Evidence Timeline",
      chainOfCustody: "Chain of Custody",
      c2paCredentials: "C2PA Content Credentials",
      supportingEvidence: "Supporting Evidence Analysis",
      forensicMetadata: "Forensic Metadata",
      noForensicPayload:
        "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference",
      runningAnalysis: "Running forensic analysis",
      refreshPage: "Refresh page",
    },
  },

  hi: {
    nav: {
      howItWorks: "यह कैसे काम करता है",
      supportedPlatforms: "समर्थित प्लेटफ़ॉर्म",
      features: "विशेषताएं",
      protect: "सुरक्षित करें",
      takedown: "हटाएं",
      investigate: "जांच करें",
      resources: "संसाधन",
      dashboard: "डैशबोर्ड",
      startVerification: "सत्यापन शुरू करें",
      protectImages: "छवियां सुरक्षित करें",
      verify: "सत्यापित करें",
    },
    hero: {
      badge: "AI-संचालित मीडिया प्रामाणिकता सत्यापन",
      heading1: "छेड़छाड़ की गई छवियों को सत्यापित करें।",
      heading2: "अपनी डिजिटल पहचान सुरक्षित रखें।",
      body: "डीपफेक और छवि छेड़छाड़ का पता लगाने के लिए बहु-स्तरीय फोरेंसिक विश्लेषण। कानूनी टेकडाउन और प्लेटफ़ॉर्म दुरुपयोग फाइलिंग के लिए क्रिप्टोग्राफिक साक्ष्य रिपोर्ट बनाएं।",
      ctaPrimary: "सत्यापन मामला बनाएं",
      ctaSecondary: "अपनी छवियां सुरक्षित करें",
      trust1: "डिफ़ॉल्ट रूप से निजी",
      trust2: "गुमनाम रिपोर्टिंग",
      trust3: "कोई खाता आवश्यक नहीं",
      stat1Label: "पहचान सटीकता",
      stat2Label: "औसत विश्लेषण समय",
      stat3Label: "क्रिप्टोग्राफिक हैशिंग",
    },
    howItWorks: {
      eyebrow: "यह कैसे काम करता है",
      heading: "छवि से साक्ष्य तक\nतीन चरणों में।",
      subheading: "कोई खाता नहीं। कोई इंस्टॉल नहीं। एक मिनट में परिणाम।",
      step1Title: "छवि अपलोड करें",
      step1Desc: "कोई भी JPEG, PNG या WebP। कोई खाता नहीं चाहिए। फ़ाइल SHA-256 हैश की जाती है — विश्लेषण के बाद आपकी मूल छवि कभी संग्रहीत नहीं होती।",
      step1Detail: "अपलोड पर SHA-256 हैश",
      step1Aside: "हम आपकी छवि कभी संग्रहीत नहीं करते",
      step2Title: "सात-स्तरीय फोरेंसिक विश्लेषण",
      step2Desc: "त्रुटि-स्तर विश्लेषण, EXIF अखंडता जांच, GAN कलाकृति पहचान, चेहरे के लैंडमार्क विकृति, क्लोन क्षेत्र मैपिंग, शोर पैटर्न और संपीड़न फिंगरप्रिंटिंग — एक साथ चलाए जाते हैं।",
      step2Detail: "~30–60 सेकंड",
      step2Aside: "सभी परतें समानांतर में चलती हैं",
      step3Title: "हस्ताक्षरित साक्ष्य रिपोर्ट डाउनलोड करें",
      step3Desc: "प्रत्येक परत के विश्वास स्कोर, एक क्रिप्टोग्राफिक केस आईडी और SHA-256 हैश के साथ एक संरचित PDF। प्लेटफ़ॉर्म टेकडाउन और कानूनी फाइलिंग के लिए।",
      step3Detail: "PDF · केस आईडी · हस्ताक्षर",
      step3Aside: "प्रमुख प्लेटफ़ॉर्म पर स्वीकृत",
    },
    common: {
      upload: "अपलोड करें",
      download: "डाउनलोड करें",
      verify: "सत्यापित करें",
      analyze: "विश्लेषण करें",
      report: "रिपोर्ट",
      caseId: "मामला आईडी",
      verdict: "निर्णय",
      submit: "जमा करें",
      back: "वापस",
      next: "आगे",
      close: "बंद करें",
      loading: "लोड हो रहा है...",
      authentic: "प्रामाणिक",
      manipulated: "छेड़छाड़ की गई",
      suspicious: "संदिग्ध",
      error: "त्रुटि",
      success: "सफल",
    },
    footer: {
      tagline: "मीडिया प्रामाणिकता सुरक्षित करना।",
      rights: "सभी अधिकार सुरक्षित।",
      privacyPolicy: "गोपनीयता नीति",
    },
    start: {
      breadcrumb: "जांच शुरू करें",
      eyebrow: "Sniffer · डिजिटल साक्ष्य प्लेटफ़ॉर्म",
      heading: "आपको क्या जांच करनी है?",
      subheading: "सभी मामले एक ही तीन-चरणीय वर्कफ़्लो का पालन करते हैं — हर जांच एक फोरेंसिक रिपोर्ट, वितरण ट्रेस और टेकडाउन मार्गदर्शन के साथ समाप्त होती है।",
      step1: "सत्यापन", step1Sub: "फोरेंसिक विश्लेषण",
      step2: "ट्रेस", step2Sub: "वितरण स्कैन",
      step3: "कार्रवाई", step3Sub: "टेकडाउन और प्रतिक्रिया",
      deepfakeTitle: "डीपफेक और AI छेड़छाड़",
      deepfakeDesc: "पता लगाएं कि कोई छवि AI-जनित, फेस-स्वैप्ड या डिजिटल रूप से छेड़छाड़ की गई है। प्रति-संकेत साक्ष्य के साथ फोरेंसिक प्रामाणिकता स्कोर तैयार करता है।",
      nciiTitle: "NCII लीक खोज और टेकडाउन",
      nciiDesc: "पता लगाएं कि बिना सहमति के छवि कहां साझा की गई है, होस्टिंग बुनियादी ढांचे की पहचान करें और प्लेटफ़ॉर्म-विशिष्ट हटाने का मार्गदर्शन प्राप्त करें।",
      screenshotTitle: "मेरे पास केवल स्क्रीनशॉट है",
      screenshotDesc: "शुरुआती साक्ष्य के रूप में स्क्रीनशॉट अपलोड करें — Sniffer मूल मीडिया के बिना भी इसका विश्लेषण करेगा।",
      sharedInfraTitle: "सभी पाइपलाइनों में साझा बुनियादी ढांचा",
      sharedInfraDesc: "हर पाइपलाइन एक केस आईडी के साथ फोरेंसिक रिपोर्ट, वितरण ट्रेस और टेकडाउन मार्गदर्शन तैयार करती है।",
    },
    upload: {
      breadcrumb: "छवि अपलोड करें",
      heading: "फोरेंसिक विश्लेषण के लिए छवि अपलोड करें",
      subheading: "आपकी छवि SHA-256 हैश की जाती है और विश्लेषण के बाद कभी संग्रहीत नहीं होती।",
      dropzoneLabel: "यहां छवि छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
      dropzoneHint: "JPEG, PNG या WebP · अधिकतम 10 MB",
      analyzeButton: "छवि विश्लेषण करें",
      supportingLabel: "सहायक साक्ष्य",
    },
    report: {
      forensicReport: "फोरेंसिक रिपोर्ट",
      confidential: "गोपनीय",
      copyHash: "हैश कॉपी करें",
      copied: "कॉपी हो गया",
      exportPdf: "PDF निर्यात करें",
      loading: "फोरेंसिक रिपोर्ट लोड हो रही है",
      loadingDetail: "केस डेटा डिक्रिप्ट हो रहा है...",
      reportUnavailable: "रिपोर्ट उपलब्ध नहीं है",
      newInvestigation: "नई जांच शुरू करें",
      printReport: "रिपोर्ट प्रिंट करें",
      disclaimer: "यह रिपोर्ट मशीन-जनित फोरेंसिक साक्ष्य है। सामग्री जांच उद्देश्यों के लिए यथावत प्रदान की गई है।",
      askAnalyst: "विश्लेषक से पूछें",
      stepAnalysis: "फोरेंसिक विश्लेषण",
      stepDistribution: "वितरण ट्रेस",
      stepTakedown: "टेकडाउन और प्रतिक्रिया",
      inProgress: "प्रगति में",
      completed: "पूर्ण",
      step: "चरण",
      caseRef: "मामला संदर्भ",
      dateFiled: "दर्ज तिथि",
      sourcePlatform: "स्रोत प्लेटफ़ॉर्म",
      issueType: "समस्या प्रकार",
      reportType: "रिपोर्ट प्रकार",
      anonymous: "गुमनाम",
      named: "नामित",
      victimStatement: "पीड़ित का बयान",
      forensicVerdict: "फोरेंसिक निर्णय",
      riskScore: "जोखिम स्कोर",
      likelyManipulated: "संभवतः छेड़छाड़ की गई",
      highSuspicion: "उच्च संदेह",
      inconclusive: "अनिर्णायक",
      likelyAuthentic: "संभवतः प्रामाणिक",
      manipulatedDesc: "कई फोरेंसिक पाइपलाइनों में मजबूत छेड़छाड़ संकेतक पाए गए।",
      highDesc: "कई छेड़छाड़ संकेत चिह्नित — मैनुअल विशेषज्ञ समीक्षा की सलाह।",
      inconclusiveDesc: "मिश्रित संकेत — निश्चित निर्णय के लिए अपर्याप्त विश्वास।",
      authenticDesc: "कोई महत्वपूर्ण छेड़छाड़ नहीं मिली। सामग्री प्रामाणिक प्रतीत होती है।",
      submittedEvidence: "प्रस्तुत साक्ष्य",
      analysisSummary: "विश्लेषण सारांश",
      neuralModel: "न्यूरल मॉडल साक्ष्य",
      forensicSignals: "फोरेंसिक संकेत",
      signals: "संकेत",
      flagged: "चिह्नित",
      signal: "संकेत",
      result: "परिणाम",
      status: "स्थिति",
      flag: "चिह्नित",
      pass: "पास",
      distributionIntel: "वितरण इंटेलिजेंस",
      distributionDesc: "प्रस्तुत साक्ष्य के दृश्य मिलान के लिए ज्ञात लीक नेटवर्क, मिरर साइट और सामग्री एग्रीगेटर को स्कैन करता है।",
      continueStep2: "चरण 02 जारी रखें",
      traceDistribution: "वितरण नेटवर्क ट्रेस करें",
      traceDistributionDesc: "पता लगाएं कि यह सामग्री वेब पर कहां फैल रही है",
      continueStep3: "चरण 03 जारी रखें",
      executeTakedown: "टेकडाउन और प्रतिक्रिया निष्पादित करें",
      executeTakedownDesc: "हटाने के अनुरोध और प्लेटफ़ॉर्म-विशिष्ट टेकडाउन नोटिस उत्पन्न करें",
      takedownResponse: "टेकडाउन और प्रतिक्रिया",
      takedownDesc: "सामग्री हटाने के अनुरोध प्रस्तुत करने के लिए नीचे दिए गए सत्यापित साक्ष्य और प्लेटफ़ॉर्म-विशिष्ट प्रक्रियाओं का उपयोग करें।",
      investigationComplete: "जांच पूर्ण",
      caseSealed: "सील कर दिया गया है",
      caseSealedDesc: "फोरेंसिक विश्लेषण पूर्ण, वितरण ट्रेस दर्ज और टेकडाउन मार्गदर्शन जारी किया गया। यह रिपोर्ट किसी भी प्लेटफ़ॉर्म, प्राधिकरण या कानूनी टीम को प्रस्तुत करने के लिए तैयार है।",
      deepfakeForensics: "डीपफेक फोरेंसिक्स",
      loggedScored: "लॉग और स्कोर किया गया",
      distributionTrace: "वितरण ट्रेस",
      networksScanned: "नेटवर्क स्कैन किए गए",
      takedownRequest: "टेकडाउन अनुरोध",
      readyToSubmit: "प्रस्तुत करने के लिए तैयार",
      startNew: "नई जांच शुरू करें",
      exportReport: "पूर्ण रिपोर्ट निर्यात करें",
      evidenceMetadata: "साक्ष्य मेटाडेटा",
      evidenceTimeline: "साक्ष्य टाइमलाइन",
      chainOfCustody: "हिरासत श्रृंखला",
      c2paCredentials: "C2PA सामग्री प्रमाणपत्र",
      supportingEvidence: "सहायक साक्ष्य विश्लेषण",
      forensicMetadata: "फोरेंसिक मेटाडेटा",
      noForensicPayload:
        "इस मामले में अभी तक कोई फोरेंसिक पेलोड संलग्न नहीं है। आप मामला संदर्भ का उपयोग करके प्लेटफ़ॉर्म टेकडाउन के साथ आगे बढ़ सकते हैं",
      runningAnalysis: "फोरेंसिक विश्लेषण चल रहा है",
      refreshPage: "पेज रिफ्रेश करें",
    },
  },

  bn: {
    nav: {
      howItWorks: "এটি কীভাবে কাজ করে",
      supportedPlatforms: "সমর্থিত প্ল্যাটফর্ম",
      features: "বৈশিষ্ট্যসমূহ",
      protect: "সুরক্ষিত করুন",
      takedown: "সরিয়ে নিন",
      investigate: "তদন্ত করুন",
      resources: "সম্পদ",
      dashboard: "ড্যাশবোর্ড",
      startVerification: "যাচাই শুরু করুন",
      protectImages: "ছবি সুরক্ষিত করুন",
      verify: "যাচাই করুন",
    },
    hero: {
      badge: "AI-চালিত মিডিয়া সত্যতা যাচাই",
      heading1: "বিকৃত ছবি যাচাই করুন।",
      heading2: "আপনার ডিজিটাল পরিচয় রক্ষা করুন।",
      body: "ডিপফেক এবং ছবি বিকৃতি সনাক্ত করতে বহু-স্তরীয় ফরেনসিক বিশ্লেষণ। আইনি টেকডাউন এবং প্ল্যাটফর্ম অপব্যবহার ফাইলিংয়ের জন্য ক্রিপ্টোগ্রাফিক প্রমাণ রিপোর্ট তৈরি করুন।",
      ctaPrimary: "যাচাই মামলা তৈরি করুন",
      ctaSecondary: "আপনার ছবি সুরক্ষিত করুন",
      trust1: "ডিফল্টভাবে ব্যক্তিগত",
      trust2: "বেনামী রিপোর্টিং",
      trust3: "কোনো অ্যাকাউন্ট প্রয়োজন নেই",
      stat1Label: "সনাক্তকরণ নির্ভুলতা",
      stat2Label: "গড় বিশ্লেষণ সময়",
      stat3Label: "ক্রিপ্টোগ্রাফিক হ্যাশিং",
    },
    howItWorks: {
      eyebrow: "এটি কীভাবে কাজ করে",
      heading: "ছবি থেকে প্রমাণ পর্যন্ত\nতিনটি ধাপে।",
      subheading: "কোনো অ্যাকাউন্ট নেই। কোনো ইনস্টল নেই। এক মিনিটের মধ্যে ফলাফল।",
      step1Title: "ছবি আপলোড করুন",
      step1Desc: "যেকোনো JPEG, PNG বা WebP। কোনো অ্যাকাউন্ট প্রয়োজন নেই। ফাইলটি SHA-256 হ্যাশ করা হয় — বিশ্লেষণের পরে মূল ছবি কখনো সংরক্ষণ করা হয় না।",
      step1Detail: "আপলোডে SHA-256 হ্যাশ",
      step1Aside: "আমরা আপনার ছবি কখনো সংরক্ষণ করি না",
      step2Title: "সাত-স্তরীয় ফরেনসিক বিশ্লেষণ",
      step2Desc: "ত্রুটি-স্তর বিশ্লেষণ, EXIF অখণ্ডতা পরীক্ষা, GAN আর্টিফ্যাক্ট শনাক্তকরণ, মুখের ল্যান্ডমার্ক বিকৃতি, ক্লোন অঞ্চল ম্যাপিং, শব্দ নিদর্শন এবং সংকোচন ফিঙ্গারপ্রিন্টিং — একযোগে চালানো হয়।",
      step2Detail: "~৩০–৬০ সেকেন্ড",
      step2Aside: "সমস্ত স্তর সমান্তরালে চলে",
      step3Title: "স্বাক্ষরিত প্রমাণ রিপোর্ট ডাউনলোড করুন",
      step3Desc: "প্রতিটি স্তরের আস্থার স্কোর, একটি ক্রিপ্টোগ্রাফিক কেস আইডি এবং SHA-256 হ্যাশ সহ একটি কাঠামোবদ্ধ PDF।",
      step3Detail: "PDF · কেস আইডি · স্বাক্ষর",
      step3Aside: "প্রধান প্ল্যাটফর্মে গৃহীত",
    },
    common: {
      upload: "আপলোড করুন",
      download: "ডাউনলোড করুন",
      verify: "যাচাই করুন",
      analyze: "বিশ্লেষণ করুন",
      report: "প্রতিবেদন",
      caseId: "মামলা আইডি",
      verdict: "রায়",
      submit: "জমা দিন",
      back: "পিছনে",
      next: "পরবর্তী",
      close: "বন্ধ করুন",
      loading: "লোড হচ্ছে...",
      authentic: "খাঁটি",
      manipulated: "বিকৃত",
      suspicious: "সন্দেহজনক",
      error: "ত্রুটি",
      success: "সফল",
    },
    footer: {
      tagline: "মিডিয়া সত্যতা সুরক্ষিত করা।",
      rights: "সর্বস্বত্ব সংরক্ষিত।",
      privacyPolicy: "গোপনীয়তা নীতি",
    },
    start: {
      breadcrumb: "তদন্ত শুরু করুন",
      eyebrow: "Sniffer · ডিজিটাল প্রমাণ প্ল্যাটফর্ম",
      heading: "আপনার কী তদন্ত করা দরকার?",
      subheading: "সমস্ত মামলা একই তিন-ধাপের কর্মপ্রবাহ অনুসরণ করে — প্রতিটি তদন্ত একটি ফরেনসিক রিপোর্ট, বিতরণ ট্রেস এবং টেকডাউন নির্দেশিকা দিয়ে শেষ হয়।",
      step1: "যাচাই", step1Sub: "ফরেনসিক বিশ্লেষণ",
      step2: "ট্রেস", step2Sub: "বিতরণ স্ক্যান",
      step3: "প্রতিক্রিয়া", step3Sub: "টেকডাউন ও প্রতিক্রিয়া",
      deepfakeTitle: "ডিপফেক ও AI ম্যানিপুলেশন",
      deepfakeDesc: "একটি ছবি AI-দ্বারা তৈরি, ফেস-সোয়াপ্ড বা ডিজিটালভাবে পরিবর্তিত কিনা তা সনাক্ত করুন।",
      nciiTitle: "NCII লিক আবিষ্কার ও টেকডাউন",
      nciiDesc: "সম্মতি ছাড়া কোথায় ছবি শেয়ার করা হয়েছে তা খুঁজুন এবং প্ল্যাটফর্ম-নির্দিষ্ট অপসারণ নির্দেশিকা পান।",
      screenshotTitle: "আমার কাছে শুধু স্ক্রিনশট আছে",
      screenshotDesc: "প্রমাণ হিসাবে একটি স্ক্রিনশট আপলোড করুন — Sniffer মূল মিডিয়া ছাড়াই বিশ্লেষণ করবে।",
      sharedInfraTitle: "সমস্ত পাইপলাইনে ভাগ করা পরিকাঠামো",
      sharedInfraDesc: "প্রতিটি পাইপলাইন একটি কেস আইডি সহ ফরেনসিক রিপোর্ট, বিতরণ ট্রেস এবং টেকডাউন নির্দেশিকা তৈরি করে।",
    },
    upload: {
      breadcrumb: "ছবি আপলোড করুন",
      heading: "ফরেনসিক বিশ্লেষণের জন্য ছবি আপলোড করুন",
      subheading: "আপনার ছবি SHA-256 হ্যাশ করা হয় এবং বিশ্লেষণের পরে সংরক্ষণ করা হয় না।",
      dropzoneLabel: "এখানে ছবি ড্রপ করুন বা ব্রাউজ করতে ক্লিক করুন",
      dropzoneHint: "JPEG, PNG বা WebP · সর্বোচ্চ 10 MB",
      analyzeButton: "ছবি বিশ্লেষণ করুন",
      supportingLabel: "সহায়ক প্রমাণ",
    },
    report: {
      forensicReport: "ফরেনসিক রিপোর্ট", confidential: "গোপনীয়", copyHash: "হ্যাশ কপি করুন", copied: "কপি হয়েছে", exportPdf: "PDF রপ্তানি করুন", loading: "ফরেনসিক রিপোর্ট লোড হচ্ছে", loadingDetail: "কেস ডেটা ডিক্রিপ্ট হচ্ছে...", reportUnavailable: "রিপোর্ট পাওয়া যায়নি", newInvestigation: "নতুন তদন্ত শুরু করুন", printReport: "রিপোর্ট প্রিন্ট করুন", disclaimer: "এই রিপোর্ট মেশিন-জনিত ফরেনসিক প্রমাণ। বিষয়বস্তু তদন্তের উদ্দেশ্যে প্রদান করা হয়েছে।", askAnalyst: "বিশ্লেষককে জিজ্ঞাসা করুন",
      stepAnalysis: "ফরেনসিক বিশ্লেষণ", stepDistribution: "বিতরণ ট্রেস", stepTakedown: "টেকডাউন ও প্রতিক্রিয়া", inProgress: "চলমান", completed: "সম্পন্ন", step: "ধাপ",
      caseRef: "কেস রেফারেন্স", dateFiled: "দাখিলের তারিখ", sourcePlatform: "উৎস প্ল্যাটফর্ম", issueType: "সমস্যার ধরন", reportType: "রিপোর্টের ধরন", anonymous: "বেনামী", named: "নামযুক্ত", victimStatement: "ভুক্তভোগীর বিবৃতি",
      forensicVerdict: "ফরেনসিক রায়", riskScore: "ঝুঁকি স্কোর", likelyManipulated: "সম্ভবত বিকৃত", highSuspicion: "উচ্চ সন্দেহ", inconclusive: "অনিশ্চিত", likelyAuthentic: "সম্ভবত খাঁটি",
      manipulatedDesc: "একাধিক ফরেনসিক পাইপলাইনে শক্তিশালী বিকৃতি সূচক পাওয়া গেছে।", highDesc: "একাধিক বিকৃতি সংকেত চিহ্নিত — বিশেষজ্ঞ পর্যালোচনার পরামর্শ।", inconclusiveDesc: "মিশ্র সংকেত — নির্দিষ্ট রায়ের জন্য অপর্যাপ্ত আস্থা।", authenticDesc: "কোনো উল্লেখযোগ্য বিকৃতি পাওয়া যায়নি। বিষয়বস্তু খাঁটি মনে হচ্ছে।",
      submittedEvidence: "জমা দেওয়া প্রমাণ", analysisSummary: "বিশ্লেষণ সারাংশ", neuralModel: "নিউরাল মডেল প্রমাণ", forensicSignals: "ফরেনসিক সংকেত", signals: "সংকেত", flagged: "চিহ্নিত", signal: "সংকেত", result: "ফলাফল", status: "স্থিতি", flag: "চিহ্নিত", pass: "পাস",
      distributionIntel: "বিতরণ বুদ্ধিমত্তা", distributionDesc: "পরিচিত লিক নেটওয়ার্ক ও মিরর সাইট স্ক্যান করে দৃশ্য মিল খোঁজে।", continueStep2: "ধাপ ০২ চালিয়ে যান", traceDistribution: "বিতরণ নেটওয়ার্ক ট্রেস করুন", traceDistributionDesc: "এই বিষয়বস্তু কোথায় ছড়াচ্ছে তা খুঁজুন", continueStep3: "ধাপ ০৩ চালিয়ে যান", executeTakedown: "টেকডাউন নির্বাহ করুন", executeTakedownDesc: "অপসারণ অনুরোধ এবং টেকডাউন নোটিশ তৈরি করুন",
      takedownResponse: "টেকডাউন ও প্রতিক্রিয়া", takedownDesc: "সামগ্রী অপসারণ অনুরোধ জমা দিতে যাচাইকৃত প্রমাণ ও পদ্ধতি ব্যবহার করুন।",
      investigationComplete: "তদন্ত সম্পন্ন", caseSealed: "সিল করা হয়েছে", caseSealedDesc: "ফরেনসিক বিশ্লেষণ সম্পূর্ণ, বিতরণ ট্রেস রেকর্ড করা হয়েছে এবং টেকডাউন নির্দেশিকা জারি করা হয়েছে।",
      deepfakeForensics: "ডিপফেক ফরেনসিকস", loggedScored: "লগ ও স্কোর করা হয়েছে", distributionTrace: "বিতরণ ট্রেস", networksScanned: "নেটওয়ার্ক স্ক্যান করা হয়েছে", takedownRequest: "টেকডাউন অনুরোধ", readyToSubmit: "জমা দিতে প্রস্তুত", startNew: "নতুন তদন্ত শুরু করুন", exportReport: "সম্পূর্ণ রিপোর্ট রপ্তানি করুন",
      evidenceMetadata: "প্রমাণ মেটাডেটা", evidenceTimeline: "প্রমাণ টাইমলাইন", chainOfCustody: "হেফাজতের শৃঙ্খল", c2paCredentials: "C2PA সামগ্রী শংসাপত্র", supportingEvidence: "সহায়ক প্রমাণ বিশ্লেষণ", forensicMetadata: "ফরেনসিক মেটাডেটা", noForensicPayload: "এই মামলায় এখনো কোনো ফরেনসিক পেলোড সংযুক্ত নেই। আপনি কেস রেফারেন্স ব্যবহার করে প্ল্যাটফর্ম টেকডাউন চালিয়ে যেতে পারেন", runningAnalysis: "ফরেনসিক বিশ্লেষণ চলছে", refreshPage: "পেজ রিফ্রেশ করুন",
    },
  },

  ta: {
    nav: {
      howItWorks: "இது எவ்வாறு செயல்படுகிறது",
      supportedPlatforms: "ஆதரிக்கப்படும் தளங்கள்",
      features: "அம்சங்கள்",
      protect: "பாதுகாக்கவும்",
      takedown: "அகற்றவும்",
      investigate: "விசாரி",
      resources: "வளங்கள்",
      dashboard: "டாஷ்போர்டு",
      startVerification: "சரிபார்ப்பை தொடங்குங்கள்",
      protectImages: "படங்களை பாதுகாக்கவும்",
      verify: "சரிபார்க்கவும்",
    },
    hero: {
      badge: "AI-இயக்கப்படும் மீடியா நம்பகத்தன்மை சரிபார்ப்பு",
      heading1: "மாற்றியமைக்கப்பட்ட படங்களை சரிபார்க்கவும்.",
      heading2: "உங்கள் டிஜிட்டல் அடையாளத்தை பாதுகாக்கவும்.",
      body: "டீப்ஃபேக் மற்றும் படத்தில் தலையீட்டை கண்டறிய பல-அடுக்கு தடயவியல் பகுப்பாய்வு. சட்ட நீக்கம் மற்றும் தளம் துஷ்பிரயோக தாக்கல்களுக்கு கிரிப்டோகிராஃபிக் சாட்சிய அறிக்கைகளை உருவாக்கவும்.",
      ctaPrimary: "சரிபார்ப்பு வழக்கை உருவாக்கு",
      ctaSecondary: "உங்கள் படங்களை பாதுகாக்கவும்",
      trust1: "இயல்பாக தனியார்",
      trust2: "அநாமதேய அறிக்கை",
      trust3: "கணக்கு தேவையில்லை",
      stat1Label: "கண்டறிதல் துல்லியம்",
      stat2Label: "சராசரி பகுப்பாய்வு நேரம்",
      stat3Label: "கிரிப்டோகிராஃபிக் ஹாஷிங்",
    },
    howItWorks: {
      eyebrow: "இது எவ்வாறு செயல்படுகிறது",
      heading: "படத்திலிருந்து சான்றுக்கு\nமூன்று படிகளில்.",
      subheading: "கணக்கு இல்லை. நிறுவல் இல்லை. ஒரு நிமிடத்தில் முடிவுகள்.",
      step1Title: "படத்தை பதிவேற்றுங்கள்",
      step1Desc: "எந்த JPEG, PNG அல்லது WebP. கணக்கு தேவையில்லை. கோப்பு SHA-256 ஹாஷ் செய்யப்படுகிறது — பகுப்பாய்வுக்கு பிறகு உங்கள் அசல் பதிவேற்றப்படாது.",
      step1Detail: "பதிவேற்றத்தில் SHA-256 ஹாஷ்",
      step1Aside: "நாங்கள் உங்கள் படத்தை சேமிக்க மாட்டோம்",
      step2Title: "ஏழு-அடுக்கு தடயவியல் பகுப்பாய்வு",
      step2Desc: "பிழை-நிலை பகுப்பாய்வு, EXIF ஒருமைப்பாடு சோதனை, GAN கலைப்பொருள் கண்டறிதல், முகம் சிதைவு, குளோன் பகுதி மேப்பிங், சத்தம் மாதிரிகள் — ஒரே நேரத்தில் இயங்கும்.",
      step2Detail: "~30–60 நொடிகள்",
      step2Aside: "அனைத்து அடுக்குகளும் இணையாக இயங்கும்",
      step3Title: "கையொப்பமிட்ட அறிக்கையை பதிவிறக்குங்கள்",
      step3Desc: "ஒவ்வொரு அடுக்கின் நம்பிக்கை மதிப்பெண்கள், கிரிப்டோகிராஃபிக் வழக்கு ஐடி மற்றும் SHA-256 ஹாஷுடன் ஒரு கட்டமைப்பு PDF.",
      step3Detail: "PDF · வழக்கு ஐடி · கையொப்பம்",
      step3Aside: "முக்கிய தளங்களால் ஏற்றுக்கொள்ளப்பட்டது",
    },
    common: {
      upload: "பதிவேற்று",
      download: "பதிவிறக்கு",
      verify: "சரிபார்க்க",
      analyze: "பகுப்பாய்வு",
      report: "அறிக்கை",
      caseId: "வழக்கு ஐடி",
      verdict: "தீர்ப்பு",
      submit: "சமர்ப்பி",
      back: "பின்னால்",
      next: "அடுத்து",
      close: "மூடு",
      loading: "ஏற்றுகிறது...",
      authentic: "உண்மையான",
      manipulated: "கையாளப்பட்ட",
      suspicious: "சந்தேகத்திற்குரிய",
      error: "பிழை",
      success: "வெற்றி",
    },
    footer: {
      tagline: "மீடியா நம்பகத்தன்மையை பாதுகாத்தல்.",
      rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      privacyPolicy: "தனியுரிமைக் கொள்கை",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report", confidential: "Confidential", copyHash: "Copy hash", copied: "Copied", exportPdf: "Export PDF", loading: "Loading forensic report", loadingDetail: "Decrypting case data...", reportUnavailable: "Report unavailable", newInvestigation: "Start a new investigation", printReport: "Print Report", disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.", askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis", stepDistribution: "Distribution Trace", stepTakedown: "Takedown & Response", inProgress: "In progress", completed: "Completed", step: "Step",
      caseRef: "Case Reference", dateFiled: "Date Filed", sourcePlatform: "Source Platform", issueType: "Issue Type", reportType: "Report Type", anonymous: "Anonymous", named: "Named", victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict", riskScore: "risk score", likelyManipulated: "Likely Manipulated", highSuspicion: "High Suspicion", inconclusive: "Inconclusive", likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.", highDesc: "Multiple manipulation signals flagged — manual expert review advised.", inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.", authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence", analysisSummary: "Analysis Summary", neuralModel: "Neural Model Evidence", forensicSignals: "Forensic Signals", signals: "signals", flagged: "flagged", signal: "Signal", result: "Result", status: "Status", flag: "Flag", pass: "Pass",
      distributionIntel: "Distribution Intelligence", distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.", continueStep2: "Continue to Step 02", traceDistribution: "Trace Distribution Network", traceDistributionDesc: "Scan where this content is spreading across the web", continueStep3: "Continue to Step 03", executeTakedown: "Execute Takedown & Response", executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response", takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete", caseSealed: "is sealed", caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics", loggedScored: "Logged & scored", distributionTrace: "Distribution trace", networksScanned: "Networks scanned", takedownRequest: "Takedown request", readyToSubmit: "Ready to submit", startNew: "Start new investigation", exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata", evidenceTimeline: "Evidence Timeline", chainOfCustody: "Chain of Custody", c2paCredentials: "C2PA Content Credentials", supportingEvidence: "Supporting Evidence Analysis", forensicMetadata: "Forensic Metadata", noForensicPayload: "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference", runningAnalysis: "Running forensic analysis", refreshPage: "Refresh page",
    },
  },

  te: {
    nav: {
      howItWorks: "ఇది ఎలా పని చేస్తుంది",
      supportedPlatforms: "మద్దతు ఉన్న వేదికలు",
      features: "లక్షణాలు",
      protect: "రక్షించండి",
      takedown: "తొలగించండి",
      investigate: "విచారించు",
      resources: "వనరులు",
      dashboard: "డాష్‌బోర్డ్",
      startVerification: "ధృవీకరణ ప్రారంభించండి",
      protectImages: "చిత్రాలను రక్షించండి",
      verify: "ధృవీకరించండి",
    },
    hero: {
      badge: "AI-ఆధారిత మీడియా ప్రామాణికత ధృవీకరణ",
      heading1: "మార్పు చేయబడిన చిత్రాలను ధృవీకరించండి.",
      heading2: "మీ డిజిటల్ గుర్తింపును రక్షించండి.",
      body: "డీప్‌ఫేక్‌లు మరియు చిత్ర వక్రీకరణను గుర్తించడానికి బహు-పొర ఫోరెన్సిక్ విశ్లేషణ. చట్టపరమైన తొలగింపు మరియు వేదిక దుర్వినియోగ దాఖళ్ళకు క్రిప్టోగ్రాఫిక్ సాక్ష్యం నివేదికలు రూపొందించండి.",
      ctaPrimary: "ధృవీకరణ కేసు సృష్టించు",
      ctaSecondary: "మీ చిత్రాలను రక్షించండి",
      trust1: "డిఫాల్ట్‌గా ప్రైవేట్",
      trust2: "అనామక నివేదికలు",
      trust3: "ఖాతా అవసరం లేదు",
      stat1Label: "గుర్తింపు ఖచ్చితత్వం",
      stat2Label: "సగటు విశ్లేషణ సమయం",
      stat3Label: "క్రిప్టోగ్రాఫిక్ హాషింగ్",
    },
    howItWorks: {
      eyebrow: "ఇది ఎలా పని చేస్తుంది",
      heading: "చిత్రం నుండి సాక్ష్యం వరకు\nమూడు దశల్లో.",
      subheading: "ఖాతా అవసరం లేదు. ఇన్‌స్టాల్ అవసరం లేదు. ఒక నిమిషంలో ఫలితాలు.",
      step1Title: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
      step1Desc: "ఏదైనా JPEG, PNG లేదా WebP. ఖాతా అవసరం లేదు. ఫైల్ SHA-256 హాష్ చేయబడుతుంది — విశ్లేషణ తర్వాత మీ అసలు చిత్రం ఎప్పుడూ నిల్వ చేయబడదు.",
      step1Detail: "అప్‌లోడ్‌లో SHA-256 హాష్",
      step1Aside: "మేము మీ చిత్రాన్ని ఎప్పుడూ నిల్వ చేయము",
      step2Title: "ఏడు-పొర ఫోరెన్సిక్ విశ్లేషణ",
      step2Desc: "లోపం-స్థాయి విశ్లేషణ, EXIF సమగ్రత తనిఖీ, GAN ఆర్టిఫ్యాక్ట్ గుర్తింపు, ముఖ నిర్మాణ వికృతి, క్లోన్ ప్రాంత మ్యాపింగ్, శబ్దం నమూనాలు — ఒకే సమయంలో నడుస్తాయి.",
      step2Detail: "~30–60 సెకన్లు",
      step2Aside: "అన్ని పొరలు సమాంతరంగా నడుస్తాయి",
      step3Title: "సంతకం చేసిన నివేదికను డౌన్‌లోడ్ చేయండి",
      step3Desc: "ప్రతి పొర నమ్మకం స్కోర్లు, క్రిప్టోగ్రాఫిక్ కేసు ID మరియు SHA-256 హాష్‌తో నిర్మాణాత్మక PDF.",
      step3Detail: "PDF · కేసు ID · సంతకం",
      step3Aside: "ప్రధాన వేదికలచే ఆమోదించబడింది",
    },
    common: {
      upload: "అప్‌లోడ్ చేయండి",
      download: "డౌన్‌లోడ్ చేయండి",
      verify: "ధృవీకరించు",
      analyze: "విశ్లేషించు",
      report: "నివేదిక",
      caseId: "కేసు ID",
      verdict: "తీర్పు",
      submit: "సమర్పించు",
      back: "వెనుకకు",
      next: "తదుపరి",
      close: "మూసివేయి",
      loading: "లోడ్ అవుతోంది...",
      authentic: "నిజమైన",
      manipulated: "మార్పు చేసిన",
      suspicious: "అనుమానాస్పద",
      error: "లోపం",
      success: "విజయవంతం",
    },
    footer: {
      tagline: "మీడియా ప్రామాణికతను కాపాడటం.",
      rights: "అన్ని హక్కులు సంరక్షించబడ్డాయి.",
      privacyPolicy: "గోప్యతా విధానం",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report", confidential: "Confidential", copyHash: "Copy hash", copied: "Copied", exportPdf: "Export PDF", loading: "Loading forensic report", loadingDetail: "Decrypting case data...", reportUnavailable: "Report unavailable", newInvestigation: "Start a new investigation", printReport: "Print Report", disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.", askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis", stepDistribution: "Distribution Trace", stepTakedown: "Takedown & Response", inProgress: "In progress", completed: "Completed", step: "Step",
      caseRef: "Case Reference", dateFiled: "Date Filed", sourcePlatform: "Source Platform", issueType: "Issue Type", reportType: "Report Type", anonymous: "Anonymous", named: "Named", victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict", riskScore: "risk score", likelyManipulated: "Likely Manipulated", highSuspicion: "High Suspicion", inconclusive: "Inconclusive", likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.", highDesc: "Multiple manipulation signals flagged — manual expert review advised.", inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.", authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence", analysisSummary: "Analysis Summary", neuralModel: "Neural Model Evidence", forensicSignals: "Forensic Signals", signals: "signals", flagged: "flagged", signal: "Signal", result: "Result", status: "Status", flag: "Flag", pass: "Pass",
      distributionIntel: "Distribution Intelligence", distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.", continueStep2: "Continue to Step 02", traceDistribution: "Trace Distribution Network", traceDistributionDesc: "Scan where this content is spreading across the web", continueStep3: "Continue to Step 03", executeTakedown: "Execute Takedown & Response", executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response", takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete", caseSealed: "is sealed", caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics", loggedScored: "Logged & scored", distributionTrace: "Distribution trace", networksScanned: "Networks scanned", takedownRequest: "Takedown request", readyToSubmit: "Ready to submit", startNew: "Start new investigation", exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata", evidenceTimeline: "Evidence Timeline", chainOfCustody: "Chain of Custody", c2paCredentials: "C2PA Content Credentials", supportingEvidence: "Supporting Evidence Analysis", forensicMetadata: "Forensic Metadata", noForensicPayload: "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference", runningAnalysis: "Running forensic analysis", refreshPage: "Refresh page",
    },
  },

  mr: {
    nav: {
      howItWorks: "हे कसे कार्य करते",
      supportedPlatforms: "समर्थित प्लॅटफॉर्म",
      features: "वैशिष्ट्ये",
      protect: "संरक्षित करा",
      takedown: "काढून टाका",
      investigate: "तपास करा",
      resources: "संसाधने",
      dashboard: "डॅशबोर्ड",
      startVerification: "पडताळणी सुरू करा",
      protectImages: "प्रतिमा संरक्षित करा",
      verify: "पडताळा",
    },
    hero: {
      badge: "AI-चालित मीडिया सत्यता पडताळणी",
      heading1: "सुधारित प्रतिमा पडताळा.",
      heading2: "तुमची डिजिटल ओळख सुरक्षित ठेवा.",
      body: "डीपफेक आणि प्रतिमा छेडछाड शोधण्यासाठी बहु-स्तरीय फोरेन्सिक विश्लेषण. कायदेशीर टेकडाउन आणि प्लॅटफॉर्म गैरवापर दाखल्यांसाठी क्रिप्टोग्राफिक पुरावा अहवाल तयार करा.",
      ctaPrimary: "पडताळणी प्रकरण तयार करा",
      ctaSecondary: "तुमच्या प्रतिमा संरक्षित करा",
      trust1: "डीफॉल्टनुसार खाजगी",
      trust2: "अनामिक अहवाल",
      trust3: "कोणतेही खाते आवश्यक नाही",
      stat1Label: "ओळख अचूकता",
      stat2Label: "सरासरी विश्लेषण वेळ",
      stat3Label: "क्रिप्टोग्राफिक हॅशिंग",
    },
    howItWorks: {
      eyebrow: "हे कसे कार्य करते",
      heading: "प्रतिमेपासून पुराव्यापर्यंत\nतीन चरणांमध्ये।",
      subheading: "कोणतेही खाते नाही. कोणतेही इंस्टॉलेशन नाही. एक मिनिटात परिणाम.",
      step1Title: "प्रतिमा अपलोड करा",
      step1Desc: "कोणतेही JPEG, PNG किंवा WebP. खाते आवश्यक नाही. फाइल SHA-256 हॅश केली जाते — विश्लेषणानंतर तुमची मूळ प्रतिमा कधीही ठेवली जात नाही.",
      step1Detail: "अपलोडवर SHA-256 हॅश",
      step1Aside: "आम्ही तुमची प्रतिमा कधीही संग्रहित करत नाही",
      step2Title: "सात-स्तरीय फोरेन्सिक विश्लेषण",
      step2Desc: "त्रुटी-स्तर विश्लेषण, EXIF अखंडता तपासणी, GAN कृत्रिम शोध, चेहऱ्याच्या खुणा विकृती, क्लोन क्षेत्र मॅपिंग, आवाज नमुने — एकाच वेळी चालवले जातात.",
      step2Detail: "~30–60 सेकंद",
      step2Aside: "सर्व स्तर समांतरपणे चालतात",
      step3Title: "स्वाक्षरी केलेला अहवाल डाउनलोड करा",
      step3Desc: "प्रत्येक स्तरासाठी विश्वास स्कोअर, क्रिप्टोग्राफिक केस आयडी आणि SHA-256 हॅशसह संरचित PDF.",
      step3Detail: "PDF · केस आयडी · स्वाक्षरी",
      step3Aside: "प्रमुख प्लॅटफॉर्मद्वारे स्वीकारले",
    },
    common: {
      upload: "अपलोड करा",
      download: "डाउनलोड करा",
      verify: "पडताळा",
      analyze: "विश्लेषण करा",
      report: "अहवाल",
      caseId: "प्रकरण आयडी",
      verdict: "निकाल",
      submit: "सबमिट करा",
      back: "मागे",
      next: "पुढे",
      close: "बंद करा",
      loading: "लोड होत आहे...",
      authentic: "वास्तविक",
      manipulated: "सुधारित",
      suspicious: "संशयास्पद",
      error: "त्रुटी",
      success: "यशस्वी",
    },
    footer: {
      tagline: "मीडिया सत्यता संरक्षित करणे.",
      rights: "सर्व हक्क राखीव.",
      privacyPolicy: "गोपनीयता धोरण",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report", confidential: "Confidential", copyHash: "Copy hash", copied: "Copied", exportPdf: "Export PDF", loading: "Loading forensic report", loadingDetail: "Decrypting case data...", reportUnavailable: "Report unavailable", newInvestigation: "Start a new investigation", printReport: "Print Report", disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.", askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis", stepDistribution: "Distribution Trace", stepTakedown: "Takedown & Response", inProgress: "In progress", completed: "Completed", step: "Step",
      caseRef: "Case Reference", dateFiled: "Date Filed", sourcePlatform: "Source Platform", issueType: "Issue Type", reportType: "Report Type", anonymous: "Anonymous", named: "Named", victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict", riskScore: "risk score", likelyManipulated: "Likely Manipulated", highSuspicion: "High Suspicion", inconclusive: "Inconclusive", likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.", highDesc: "Multiple manipulation signals flagged — manual expert review advised.", inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.", authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence", analysisSummary: "Analysis Summary", neuralModel: "Neural Model Evidence", forensicSignals: "Forensic Signals", signals: "signals", flagged: "flagged", signal: "Signal", result: "Result", status: "Status", flag: "Flag", pass: "Pass",
      distributionIntel: "Distribution Intelligence", distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.", continueStep2: "Continue to Step 02", traceDistribution: "Trace Distribution Network", traceDistributionDesc: "Scan where this content is spreading across the web", continueStep3: "Continue to Step 03", executeTakedown: "Execute Takedown & Response", executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response", takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete", caseSealed: "is sealed", caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics", loggedScored: "Logged & scored", distributionTrace: "Distribution trace", networksScanned: "Networks scanned", takedownRequest: "Takedown request", readyToSubmit: "Ready to submit", startNew: "Start new investigation", exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata", evidenceTimeline: "Evidence Timeline", chainOfCustody: "Chain of Custody", c2paCredentials: "C2PA Content Credentials", supportingEvidence: "Supporting Evidence Analysis", forensicMetadata: "Forensic Metadata", noForensicPayload: "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference", runningAnalysis: "Running forensic analysis", refreshPage: "Refresh page",
    },
  },

  kn: {
    nav: {
      howItWorks: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
      supportedPlatforms: "ಬೆಂಬಲಿತ ವೇದಿಕೆಗಳು",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      protect: "ರಕ್ಷಿಸಿ",
      takedown: "ತೆಗೆದುಹಾಕಿ",
      investigate: "ತನಿಖೆ ಮಾಡಿ",
      resources: "ಸಂಪನ್ಮೂಲಗಳು",
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      startVerification: "ಪರಿಶೀಲನೆ ಪ್ರಾರಂಭಿಸಿ",
      protectImages: "ಚಿತ್ರಗಳನ್ನು ರಕ್ಷಿಸಿ",
      verify: "ಪರಿಶೀಲಿಸಿ",
    },
    hero: {
      badge: "AI-ಚಾಲಿತ ಮಾಧ್ಯಮ ಸತ್ಯಾಪನೆ",
      heading1: "ಮಾರ್ಪಡಿಸಲಾದ ಚಿತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      heading2: "ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಗುರುತನ್ನು ರಕ್ಷಿಸಿ.",
      body: "ಡೀಪ್‌ಫೇಕ್ ಮತ್ತು ಚಿತ್ರ ತಿದ್ದುಪಡಿ ಪತ್ತೆ ಮಾಡಲು ಬಹು-ಪದರ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ. ಕಾನೂನು ತೆಗೆದುಹಾಕಲು ಮತ್ತು ವೇದಿಕೆ ದುರ್ವಿನಿಯೋಗ ದಾಖಲೆಗಳಿಗಾಗಿ ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಸಾಕ್ಷ್ಯ ವರದಿಗಳನ್ನು ರಚಿಸಿ.",
      ctaPrimary: "ಪರಿಶೀಲನೆ ಪ್ರಕರಣ ರಚಿಸಿ",
      ctaSecondary: "ನಿಮ್ಮ ಚಿತ್ರಗಳನ್ನು ರಕ್ಷಿಸಿ",
      trust1: "ಡೀಫಾಲ್ಟ್ ಆಗಿ ಖಾಸಗಿ",
      trust2: "ಅನಾಮಿಕ ವರದಿ",
      trust3: "ಖಾತೆ ಅಗತ್ಯವಿಲ್ಲ",
      stat1Label: "ಪತ್ತೆ ನಿಖರತೆ",
      stat2Label: "ಸರಾಸರಿ ವಿಶ್ಲೇಷಣೆ ಸಮಯ",
      stat3Label: "ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಹ್ಯಾಶಿಂಗ್",
    },
    howItWorks: {
      eyebrow: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
      heading: "ಚಿತ್ರದಿಂದ ಸಾಕ್ಷ್ಯಕ್ಕೆ\nಮೂರು ಹಂತಗಳಲ್ಲಿ.",
      subheading: "ಖಾತೆ ಇಲ್ಲ. ಇನ್‌ಸ್ಟಾಲ್ ಇಲ್ಲ. ಒಂದು ನಿಮಿಷದಲ್ಲಿ ಫಲಿತಾಂಶಗಳು.",
      step1Title: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      step1Desc: "ಯಾವುದೇ JPEG, PNG ಅಥವಾ WebP. ಖಾತೆ ಅಗತ್ಯವಿಲ್ಲ. ಫೈಲ್ SHA-256 ಹ್ಯಾಶ್ ಮಾಡಲಾಗುತ್ತದೆ — ವಿಶ್ಲೇಷಣೆಯ ನಂತರ ನಿಮ್ಮ ಮೂಲ ಚಿತ್ರ ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸಲ್ಪಡುವುದಿಲ್ಲ.",
      step1Detail: "ಅಪ್‌ಲೋಡ್‌ನಲ್ಲಿ SHA-256 ಹ್ಯಾಶ್",
      step1Aside: "ನಾವು ನಿಮ್ಮ ಚಿತ್ರವನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ",
      step2Title: "ಏಳು-ಪದರ ಫೋರೆನ್ಸಿಕ್ ವಿಶ್ಲೇಷಣೆ",
      step2Desc: "ದೋಷ-ಮಟ್ಟ ವಿಶ್ಲೇಷಣೆ, EXIF ​​ಸಮಗ್ರತೆ ಪರೀಕ್ಷೆ, GAN ಕಲಾಕೃತಿ ಪತ್ತೆ, ಮುಖದ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ ವಿರೂಪ, ಕ್ಲೋನ್ ಪ್ರದೇಶ ಮ್ಯಾಪಿಂಗ್ — ಏಕಕಾಲದಲ್ಲಿ ಚಾಲನೆ.",
      step2Detail: "~30–60 ಸೆಕೆಂಡ್‌ಗಳು",
      step2Aside: "ಎಲ್ಲ ಪದರಗಳು ಸಮಾನಾಂತರವಾಗಿ ಚಲಿಸುತ್ತವೆ",
      step3Title: "ಸಹಿ ಮಾಡಿದ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
      step3Desc: "ಪ್ರತಿ ಪದರದ ವಿಶ್ವಾಸದ ಅಂಕಗಳು, ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಕೇಸ್ ID ಮತ್ತು SHA-256 ಹ್ಯಾಶ್ ಸಹಿತ ರಚನಾತ್ಮಕ PDF.",
      step3Detail: "PDF · ಕೇಸ್ ID · ಸಹಿ",
      step3Aside: "ಪ್ರಮುಖ ವೇದಿಕೆಗಳಿಂದ ಸ್ವೀಕರಿಸಲ್ಪಟ್ಟಿದೆ",
    },
    common: {
      upload: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      download: "ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
      verify: "ಪರಿಶೀಲಿಸಿ",
      analyze: "ವಿಶ್ಲೇಷಿಸಿ",
      report: "ವರದಿ",
      caseId: "ಪ್ರಕರಣ ID",
      verdict: "ತೀರ್ಪು",
      submit: "ಸಲ್ಲಿಸಿ",
      back: "ಹಿಂದೆ",
      next: "ಮುಂದೆ",
      close: "ಮುಚ್ಚಿ",
      loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      authentic: "ಅಸಲಿ",
      manipulated: "ಮಾರ್ಪಡಿಸಿದ",
      suspicious: "ಅನುಮಾನಾಸ್ಪದ",
      error: "ದೋಷ",
      success: "ಯಶಸ್ವಿ",
    },
    footer: {
      tagline: "ಮಾಧ್ಯಮ ಸತ್ಯಾಪನೆ ರಕ್ಷಿಸುವುದು.",
      rights: "ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
      privacyPolicy: "ಗೋಪ್ಯತೆ ನೀತಿ",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report", confidential: "Confidential", copyHash: "Copy hash", copied: "Copied", exportPdf: "Export PDF", loading: "Loading forensic report", loadingDetail: "Decrypting case data...", reportUnavailable: "Report unavailable", newInvestigation: "Start a new investigation", printReport: "Print Report", disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.", askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis", stepDistribution: "Distribution Trace", stepTakedown: "Takedown & Response", inProgress: "In progress", completed: "Completed", step: "Step",
      caseRef: "Case Reference", dateFiled: "Date Filed", sourcePlatform: "Source Platform", issueType: "Issue Type", reportType: "Report Type", anonymous: "Anonymous", named: "Named", victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict", riskScore: "risk score", likelyManipulated: "Likely Manipulated", highSuspicion: "High Suspicion", inconclusive: "Inconclusive", likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.", highDesc: "Multiple manipulation signals flagged — manual expert review advised.", inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.", authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence", analysisSummary: "Analysis Summary", neuralModel: "Neural Model Evidence", forensicSignals: "Forensic Signals", signals: "signals", flagged: "flagged", signal: "Signal", result: "Result", status: "Status", flag: "Flag", pass: "Pass",
      distributionIntel: "Distribution Intelligence", distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.", continueStep2: "Continue to Step 02", traceDistribution: "Trace Distribution Network", traceDistributionDesc: "Scan where this content is spreading across the web", continueStep3: "Continue to Step 03", executeTakedown: "Execute Takedown & Response", executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response", takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete", caseSealed: "is sealed", caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics", loggedScored: "Logged & scored", distributionTrace: "Distribution trace", networksScanned: "Networks scanned", takedownRequest: "Takedown request", readyToSubmit: "Ready to submit", startNew: "Start new investigation", exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata", evidenceTimeline: "Evidence Timeline", chainOfCustody: "Chain of Custody", c2paCredentials: "C2PA Content Credentials", supportingEvidence: "Supporting Evidence Analysis", forensicMetadata: "Forensic Metadata", noForensicPayload: "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference", runningAnalysis: "Running forensic analysis", refreshPage: "Refresh page",
    },
  },

  gu: {
    nav: {
      howItWorks: "આ કેવી રીતે કામ કરે છે",
      supportedPlatforms: "સમર્થિત પ્લેટફોર્મ્સ",
      features: "વૈશિષ્ટ્યો",
      protect: "સુરક્ષિત કરો",
      takedown: "દૂર કરો",
      investigate: "તપાસ કરો",
      resources: "સ્રોત",
      dashboard: "ડૅશબોર્ડ",
      startVerification: "ચકાસણી શરૂ કરો",
      protectImages: "છબીઓ સુરક્ષિત કરો",
      verify: "ચકાસો",
    },
    hero: {
      badge: "AI-સંચાલિત મીડિયા અધિકૃતતા ચકાસણી",
      heading1: "ફેરફાર કરેલ છબીઓ ચકાસો.",
      heading2: "તમારી ડિજિટલ ઓળખ સુરક્ષિત કરો.",
      body: "ડીપફેક અને છબી ચેડા શોધવા માટે બહુ-સ્તરીય ફોરેન્સિક વિશ્લેષણ. કાનૂની ટેકડાઉન અને પ્લેટફોર્મ દુરુપયોગ ફાઇલિંગ માટે ક્રિપ્ટોગ્રાફિક પુરાવા અહેવાલ બનાવો.",
      ctaPrimary: "ચકાસણી કેસ બનાવો",
      ctaSecondary: "તમારી છબીઓ સુરક્ષિત કરો",
      trust1: "ડિફૉલ્ટ રીતે ખાનગી",
      trust2: "અનામી રિપોર્ટિંગ",
      trust3: "કોઈ એકાઉન્ટ જરૂરી નથી",
      stat1Label: "શોધ ચોકસાઈ",
      stat2Label: "સરેરાશ વિશ્લેષણ સમય",
      stat3Label: "ક્રિપ્ટોગ્રાફિક હૅશિંગ",
    },
    howItWorks: {
      eyebrow: "આ કેવી રીતે કામ કરે છે",
      heading: "છબીથી પુરાવા સુધી\nત્રણ પગલાઓમાં.",
      subheading: "કોઈ એકાઉન્ટ નહીં. કોઈ ઇન્સ્ટૉલ નહીં. એક મિનિટમાં પરિણામ.",
      step1Title: "છબી અપલોડ કરો",
      step1Desc: "કોઈ પણ JPEG, PNG અથવા WebP. ખાતું જરૂરી નથી. ફાઇલ SHA-256 હૅશ કરવામાં આવે છે — વિશ્લેષણ પછી તમારી મૂળ છબી ક્યારેય સંગ્રહિત કરવામાં આવતી નથી.",
      step1Detail: "અપલોડ પર SHA-256 હૅશ",
      step1Aside: "અમે તમારી છબી ક્યારેય સંગ્રહિત કરતા નથી",
      step2Title: "સાત-સ્તરીય ફોરેન્સિક વિશ્લેષણ",
      step2Desc: "ભૂલ-સ્તર વિશ્લેષણ, EXIF અખંડિતતા તપાસ, GAN આર્ટિફૅક્ટ શોધ, ચહેરાના ભૂ-ચિહ્ન વિકૃતિ, ક્લોન ક્ષેત્ર મૅપિંગ, અવાજ પૅટર્ન — એક સાથે ચાલે છે.",
      step2Detail: "~30–60 સેકન્ડ",
      step2Aside: "બધા સ્તરો સમાંતર ચાલે છે",
      step3Title: "સહી કરેલ અહેવાલ ડાઉનલોડ કરો",
      step3Desc: "દરેક સ્તર માટે વિશ્વાસ સ્કોર, ક્રિપ્ટોગ્રાફિક કેસ ID અને SHA-256 હૅશ સાથે રચનાત્મક PDF.",
      step3Detail: "PDF · કેસ ID · સ્હી",
      step3Aside: "મુખ્ય પ્લેટફોર્મ દ્વારા સ્વીકારવામાં આવ્યું",
    },
    common: {
      upload: "અપલોડ કરો",
      download: "ડાઉનલોડ કરો",
      verify: "ચકાસો",
      analyze: "વિશ્લેષણ કરો",
      report: "અહેવાલ",
      caseId: "કેસ ID",
      verdict: "ચુકાદો",
      submit: "સબમિટ કરો",
      back: "પાછળ",
      next: "આગળ",
      close: "બંધ કરો",
      loading: "લોડ થઈ રહ્યું છે...",
      authentic: "અસ્સલ",
      manipulated: "ફેરફારિત",
      suspicious: "શંકાસ્પદ",
      error: "ભૂલ",
      success: "સફળ",
    },
    footer: {
      tagline: "મીડિયા અધિકૃતતા સુરક્ષિત કરવી.",
      rights: "તમામ અધિકારો સુરક્ષિત.",
      privacyPolicy: "ગોપનીયતા નીતિ",
    },
    start: {
      breadcrumb: "Start Investigation",
      eyebrow: "Sniffer · Digital Evidence Platform",
      heading: "What do you need to investigate?",
      subheading: "All cases follow the same three-step workflow — every investigation ends with a forensic report, distribution trace, and takedown guidance.",
      step1: "Verify", step1Sub: "Forensic Analysis",
      step2: "Trace", step2Sub: "Distribution Scan",
      step3: "Respond", step3Sub: "Takedown & Response",
      deepfakeTitle: "Deepfake & AI Manipulation",
      deepfakeDesc: "Detect whether an image has been AI-generated, face-swapped, or digitally tampered. Produces a forensic authenticity score with per-signal evidence.",
      nciiTitle: "NCII Leak Discovery & Takedown",
      nciiDesc: "Find where an image has been shared without consent, identify the hosting infrastructure, and get platform-specific removal guidance.",
      screenshotTitle: "I only have a screenshot",
      screenshotDesc: "Upload a screenshot as starting evidence — Sniffer will analyse it and open a case even without the original media.",
      sharedInfraTitle: "Shared infrastructure across all pipelines",
      sharedInfraDesc: "Every pipeline produces a case ID with a forensic report, distribution trace, and takedown guidance that can be referenced in legal correspondence.",
    },
    upload: {
      breadcrumb: "Upload Image",
      heading: "Upload an image for forensic analysis",
      subheading: "Your image is SHA-256 hashed on receipt and never stored after analysis.",
      dropzoneLabel: "Drop an image here or click to browse",
      dropzoneHint: "JPEG, PNG, or WebP · Max 10 MB",
      analyzeButton: "Analyze Image",
      supportingLabel: "Supporting Evidence",
    },
    report: {
      forensicReport: "Forensic Report", confidential: "Confidential", copyHash: "Copy hash", copied: "Copied", exportPdf: "Export PDF", loading: "Loading forensic report", loadingDetail: "Decrypting case data...", reportUnavailable: "Report unavailable", newInvestigation: "Start a new investigation", printReport: "Print Report", disclaimer: "This report is machine-generated forensic evidence. Contents are provided as-is for investigative purposes. Results should be verified by qualified digital forensics professionals before legal proceedings.", askAnalyst: "Ask the Analyst",
      stepAnalysis: "Forensic Analysis", stepDistribution: "Distribution Trace", stepTakedown: "Takedown & Response", inProgress: "In progress", completed: "Completed", step: "Step",
      caseRef: "Case Reference", dateFiled: "Date Filed", sourcePlatform: "Source Platform", issueType: "Issue Type", reportType: "Report Type", anonymous: "Anonymous", named: "Named", victimStatement: "Victim Statement",
      forensicVerdict: "Forensic Verdict", riskScore: "risk score", likelyManipulated: "Likely Manipulated", highSuspicion: "High Suspicion", inconclusive: "Inconclusive", likelyAuthentic: "Likely Authentic",
      manipulatedDesc: "Strong manipulation indicators detected across multiple forensic pipelines.", highDesc: "Multiple manipulation signals flagged — manual expert review advised.", inconclusiveDesc: "Mixed signals detected — insufficient confidence for a definitive verdict.", authenticDesc: "No significant manipulation detected. Content appears authentic.",
      submittedEvidence: "Submitted Evidence", analysisSummary: "Analysis Summary", neuralModel: "Neural Model Evidence", forensicSignals: "Forensic Signals", signals: "signals", flagged: "flagged", signal: "Signal", result: "Result", status: "Status", flag: "Flag", pass: "Pass",
      distributionIntel: "Distribution Intelligence", distributionDesc: "Perceptual fingerprinting engine scans known leak networks, mirror sites, and content aggregators for visual matches of the submitted evidence.", continueStep2: "Continue to Step 02", traceDistribution: "Trace Distribution Network", traceDistributionDesc: "Scan where this content is spreading across the web", continueStep3: "Continue to Step 03", executeTakedown: "Execute Takedown & Response", executeTakedownDesc: "Generate removal requests and platform-specific takedown notices",
      takedownResponse: "Takedown & Response", takedownDesc: "Use the verified evidence and platform-specific procedures below to submit content removal requests. All forensic metadata has been preserved for legal admissibility.",
      investigationComplete: "Investigation Complete", caseSealed: "is sealed", caseSealedDesc: "Forensic analysis is complete, distribution trace recorded, and takedown guidance has been issued. This report is preserved and ready to present to any platform, authority, or legal team.",
      deepfakeForensics: "Deepfake forensics", loggedScored: "Logged & scored", distributionTrace: "Distribution trace", networksScanned: "Networks scanned", takedownRequest: "Takedown request", readyToSubmit: "Ready to submit", startNew: "Start new investigation", exportReport: "Export full report",
      evidenceMetadata: "Evidence Metadata", evidenceTimeline: "Evidence Timeline", chainOfCustody: "Chain of Custody", c2paCredentials: "C2PA Content Credentials", supportingEvidence: "Supporting Evidence Analysis", forensicMetadata: "Forensic Metadata", noForensicPayload: "No forensic payload is attached to this case yet. You can still proceed with platform takedown using case reference", runningAnalysis: "Running forensic analysis", refreshPage: "Refresh page",
    },
  },
};
