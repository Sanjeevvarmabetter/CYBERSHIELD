from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/education", tags=["Public Safety Center"])

SAFETY_MODULES: List[Dict[str, Any]] = [
    {
        "id": "upi-fraud",
        "title": "UPI & Payment App Scams",
        "subtitle": "Protecting yourself from 'Pin to Receive' and QR code traps",
        "category": "FINANCIAL_FRAUD",
        "severity": "HIGH",
        "overview": "Unified Payments Interface (UPI) allows instantaneous fund transfers across India. Fraudsters exploit social engineering rather than technical flaws, tricking victims into authorizing debits under the guise of receiving money.",
        "how_it_operates": [
            "Fraudster poses as buyer on OLX/Marketplace and sends a 'Collect Request' or QR code.",
            "Victim is told: 'Scan this QR code and enter your UPI PIN to receive the advance payment.'",
            "Entering the UPI PIN authorizes a DEBIT from the victim's bank account instantly."
        ],
        "warning_signs": [
            "Any claim that you must enter your UPI PIN to RECEIVE money. (UPI PIN is ONLY needed to SEND money).",
            "Caller asking you to install remote access apps like AnyDesk, TeamViewer, or RustDesk.",
            "SMS with spoofed sender headers claiming account suspension unless KYC is completed."
        ],
        "prevention_steps": [
            "Rule #1: You NEVER need to enter your UPI PIN or scan a QR code to receive money.",
            "Never share OTPs, UPI PINs, or debit card CVVs with anyone, even if they claim to be bank officials.",
            "Verify UPI VPA identity on your payment app before entering any PIN for payments."
        ],
        "if_affected": [
            "Call the National Financial Cyber Fraud Helpline immediately at 1930.",
            "Log in to your bank app or call bank customer care to freeze net banking/UPI access.",
            "File a complaint at the official portal: https://cybercrime.gov.in within the 'Golden Hour' (first 2-3 hours) to stop fund transfer."
        ]
    },
    {
        "id": "fake-job-scams",
        "title": "Fake Job & Part-Time Work Scams",
        "subtitle": "Telegram task scams, like-and-subscribe traps, and advance registration fees",
        "category": "FAKE_JOB",
        "severity": "HIGH",
        "overview": "Scammers contact job seekers via WhatsApp or Telegram offering lucrative 'work from home' tasks (such as rating YouTube videos, reviewing hotels on Google Maps, or cryptocurrency trading).",
        "how_it_operates": [
            "Small initial payments (₹150–₹500) are paid out promptly to build false trust.",
            "Victim is added to a VIP Telegram group where other accounts (shills) claim huge profits.",
            "Victim is asked to 'recharge' or deposit money into accounts to unlock 'prepaid high-yield tasks'.",
            "When the victim tries to withdraw, the fraudsters demand 'taxes' or 'unfreeze fees' until the victim is completely drained."
        ],
        "warning_signs": [
            "Unsolicited WhatsApp/SMS messages offering ₹3,000–₹8,000 per day for simple 10-minute tasks.",
            "Communication exclusively conducted over Telegram with anonymous 'mentors'.",
            "Requiring you to pay any advance fee, registration fee, or security deposit for a job."
        ],
        "prevention_steps": [
            "Legitimate companies never ask employees or freelancers to pay money to receive work.",
            "Verify vacancies on the company's official corporate careers website.",
            "Block and report unsolicited job offers from international country codes (+62, +84, +234, etc.)."
        ],
        "if_affected": [
            "Cease all payments immediately. Do not pay 'tax' or 'unfreeze' charges—it is a sunken cost trap.",
            "Preserve chat transcripts, transaction UTR numbers, and bank account details.",
            "Report immediately to 1930 and https://cybercrime.gov.in."
        ]
    },
    {
        "id": "sextortion-harassment",
        "title": "Sextortion & Online Harassment",
        "subtitle": "Emergency steps for video call blackmail, morphed images, and cyberbullying",
        "category": "SEXTORTION",
        "severity": "CRITICAL",
        "overview": "Perpetrators record victims during compromised video calls or use AI deepfake technology to morph social media photos, subsequently threatening to distribute the images to family and friends unless money is paid.",
        "how_it_operates": [
            "Friend request on Instagram or WhatsApp from an attractive profile.",
            "Quick transition to a video call where an explicit video is played on the other side.",
            "Victim's face is screen-recorded alongside explicit footage or deepfaked.",
            "Immediate extortion demands are sent with screenshots of the victim's social media follower list."
        ],
        "warning_signs": [
            "Strangers immediately initiating video calls without text conversation.",
            "Blackmail messages demanding money via UPI within minutes under threat of public defamation.",
            "Callers claiming to be 'Cyber Police Officers' or YouTube officials demanding settlement money."
        ],
        "prevention_steps": [
            "Never accept video calls from unknown contacts on WhatsApp, Instagram, or Telegram.",
            "Keep your social media accounts private and limit who can see your followers/friends list.",
            "Be aware that paying the blackmailer NEVER stops the extortion—they will always demand more."
        ],
        "if_affected": [
            "DO NOT PAY MONEY. Paying signals compliance and invites escalated demands.",
            "Do not delete chat logs immediately: take screenshots showing the blackmailer's handle and phone number as evidence.",
            "Block the perpetrator across platforms and adjust privacy settings to strictly private.",
            "Report immediately to https://cybercrime.gov.in under the 'Report Women/Child Related Crime' section.",
            "Utilize StopNCII.org (supported by Meta) to generate cryptographic hashes that prevent intimate images from being uploaded across major social platforms."
        ]
    },
    {
        "id": "phishing-bank-kyc",
        "title": "Bank KYC & Electricity Bill Phishing",
        "subtitle": "Fake APK apps, urgent disconnection threats, and credential harvesting",
        "category": "PHISHING",
        "severity": "HIGH",
        "overview": "SMS and WhatsApp messages claim that your bank account, SIM card, or electricity connection will be disconnected today unless you update your KYC or pay a token bill via a provided link or APK file.",
        "how_it_operates": [
            "Urgent SMS: 'Dear Customer, your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call 987xxxxxxx immediately.'",
            "Victim calls; fraudster sends an APK link (e.g., 'Bijli-Update.apk') or phishing link mimicking the official utility portal.",
            "The malicious app intercepts SMS and OTPs, allowing attackers to compromise bank accounts in the background."
        ],
        "warning_signs": [
            "SMS sent from standard 10-digit mobile numbers instead of official government/utility sender IDs (e.g., VM-BESCOM, JD-SBINB).",
            "Direct links prompting download of an Android .APK file outside Google Play Store.",
            "Extreme artificial urgency ('Disconnecting in 1 hour', 'Account blocked today')."
        ],
        "prevention_steps": [
            "Never install .apk files sent over WhatsApp, SMS, or Telegram.",
            "Pay utility bills only through official apps (e.g., BESCOM, TNEB, Tata Power) or authorized platforms like Bharat BillPay (BBPS).",
            "Banks in India never ask for KYC updates via third-party web links."
        ],
        "if_affected": [
            "Turn on Airplane Mode immediately or uninstall the suspicious app.",
            "Contact your telecom operator to secure your SIM card.",
            "Inform your bank immediately to block internet banking and UPI.",
            "Report the fraud to 1930 and https://cybercrime.gov.in."
        ]
    }
]

OFFICIAL_EMERGENCY_RESOURCES = {
    "india": {
        "financial_fraud_helpline": "1930",
        "national_cybercrime_portal": "https://cybercrime.gov.in",
        "cert_in": "https://www.cert-in.org.in",
        "national_commission_for_women": "7827170170",
        "women_helpline": "1091",
        "emergency_police": "112",
        "stop_ncii": "https://stopncii.org"
    },
    "guidance_note": (
        "IMPORTANT: CYBERSHIELD is an educational and analytical assistance platform. "
        "A submission to CYBERSHIELD is not an official legal police complaint. If you have "
        "lost money or face immediate threats, report to 1930 or your local police jurisdiction."
    )
}

@router.get("/guides")
def get_safety_guides():
    """Retrieve curated cybercrime safety and prevention guides."""
    return {"status": "success", "guides": SAFETY_MODULES}

@router.get("/emergency-resources")
def get_emergency_resources():
    """Retrieve authoritative emergency contact numbers and reporting URLs."""
    return {"status": "success", "resources": OFFICIAL_EMERGENCY_RESOURCES}
