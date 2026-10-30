import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Scenario {
  id: number;
  title: string;
  category: string;
  scenarioText: string;
  senderHeader: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "The OLX 'Scan to Receive' UPI Trap",
    category: "FINANCIAL_FRAUD",
    senderHeader: "+91-98210-XXXXX (OLX Buyer)",
    scenarioText: "You listed an old sofa on OLX for ₹12,000. Within 5 minutes, a buyer messages: 'I want to buy immediately for my army posting. I am sending you a QR code. Just scan it on PhonePe and enter your UPI PIN, and the ₹12,000 will be credited directly to your bank account.'",
    options: [
      {
        text: "Scan the QR code and enter UPI PIN promptly to collect the money.",
        isCorrect: false,
        explanation: "INCORRECT! Rule #1 of UPI: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money. Entering your PIN authorizes a debit from your bank account."
      },
      {
        text: "Refuse to scan, do not enter any PIN, and block the buyer.",
        isCorrect: true,
        explanation: "CORRECT! You recognized the golden rule of UPI. A PIN is strictly required to SEND money. Anyone asking you to enter your PIN to receive money is executing a fraud."
      }
    ]
  },
  {
    id: 2,
    title: "The Telegram 'YouTube Like & Earn' Task Scam",
    category: "FAKE_JOB",
    senderHeader: "+62 812-XXXXX (WhatsApp Recruiter)",
    scenarioText: "You receive an unsolicited WhatsApp text: 'Hello! I am HR from Global Media. Earn ₹3,000 daily working from home by rating 3 hotel videos on YouTube.' You try it and they instantly pay ₹150 into your UPI! Then they add you to a VIP Telegram group and say: 'To unlock today's ₹8,000 payout, deposit a ₹2,000 security recharge.'",
    options: [
      {
        text: "Deposit ₹2,000 because they already paid ₹150 and proved they are legitimate.",
        isCorrect: false,
        explanation: "INCORRECT! This is the classic Telegram Task Bait. Fraudsters pay a small token (₹100–₹300) to build false confidence, then systematically demand escalating deposits (₹2,000, ₹10,000, ₹50,000) that can never be withdrawn."
      },
      {
        text: "Keep the initial ₹150, refuse all deposit requests, exit the group, and block them.",
        isCorrect: true,
        explanation: "CORRECT! Legitimate employment never requires workers to pay advance 'recharge' fees to unlock their own earned salary. You avoided a sunken-cost trap."
      }
    ]
  },
  {
    id: 3,
    title: "The Urgent Electricity Disconnection SMS",
    category: "UTILITY_PHISHING",
    senderHeader: "+91-98765-43210 (10-Digit Mobile)",
    scenarioText: "At 7:30 PM, you receive an SMS: 'Dear Consumer, your electricity connection will be disconnected tonight at 9:30 PM because previous month bill was not updated. Immediately contact our electricity officer Mr. Sharma at 9876543210.'",
    options: [
      {
        text: "Panic and dial 9876543210 immediately so your power doesn't get cut.",
        isCorrect: false,
        explanation: "INCORRECT! Utility companies never send disconnection notices via personal 10-digit mobile numbers 2 hours before cutoff. The caller would ask you to download a malicious screen-sharing app like AnyDesk to compromise your bank account."
      },
      {
        text: "Ignore the phone number; verify your actual bill status on the official electricity portal or Bharat BillPay (BBPS).",
        isCorrect: true,
        explanation: "CORRECT! Government utility providers communicate via registered alphabetical sender IDs (e.g. VM-BESCOM, VK-TNEB). Always verify bills through official banking apps or utility portals."
      }
    ]
  },
  {
    id: 4,
    title: "The Video Call Sextortion Threat",
    category: "SEXTORTION",
    senderHeader: "Instagram Direct Message (New Profile)",
    scenarioText: "After accepting an unexpected video call on WhatsApp from an unknown number, you are sent a recorded clip showing your face alongside an explicit video. The sender demands: 'Send ₹30,000 to this UPI VPA within 15 minutes or I will post this to your family on Facebook and YouTube.'",
    options: [
      {
        text: "Pay the ₹30,000 quickly so they delete the video and leave you alone.",
        isCorrect: false,
        explanation: "INCORRECT! Paying extortionists NEVER stops the blackmail. Once they confirm you have money and are compliant, they will demand ₹50,000, then ₹1,00,000."
      },
      {
        text: "DO NOT PAY. Preserve screenshots with handles, block the user, report to 1930 / cybercrime.gov.in, and submit image hash to StopNCII.org.",
        isCorrect: true,
        explanation: "CORRECT! Non-compliance, digital evidence preservation, and utilizing StopNCII.org to cryptographically block the media across social platforms is the recommended national cyber defense protocol."
      }
    ]
  }
];

export const ScamChallenge: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (scenario.options[idx].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentIdx + 1 < SCENARIOS.length) {
      setCurrentIdx((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const resetChallenge = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setFinished(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Award className="w-3.5 h-3.5" />
          <span>CYBER CITIZEN DEFENSE CHALLENGE</span>
        </div>
        <h1 className="text-3xl font-black text-white">"Spot The Scam" Interactive Simulator</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Test your instincts against real-world social engineering vectors. Learn to spot the psychological traps used by financial fraudsters and cyber extortionists.
        </p>
      </div>

      {!finished ? (
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-3 border-b border-navy-800">
            <span>SCENARIO {scenario.id} OF {SCENARIOS.length}</span>
            <span>CURRENT SCORE: {score}</span>
          </div>

          {/* Scenario Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{scenario.title}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-800 text-cyan-400 border border-navy-700">
                {scenario.category}
              </span>
            </div>

            {/* Mock Notification Bubble */}
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5 font-sans">
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>From: {scenario.senderHeader}</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed italic">
                "{scenario.scenarioText}"
              </p>
            </div>
          </div>

          {/* Interactive Choices */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              What is your defensive action?
            </div>

            {scenario.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 rounded-xl text-left text-xs md:text-sm transition flex items-start space-x-3 border ${
                    selectedOption === null
                      ? 'bg-navy-950 border-navy-800 hover:border-cyan-500/50 hover:bg-navy-800/40 text-slate-200'
                      : opt.isCorrect
                      ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200 font-semibold'
                      : isChosen
                      ? 'bg-red-950/70 border-red-700 text-red-200 font-semibold'
                      : 'bg-navy-950 border-navy-800 opacity-40 text-slate-400'
                  }`}
                >
                  <span className="font-mono text-slate-400 font-bold mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <div className="flex-1">
                    <div>{opt.text}</div>
                    {showResult && (isChosen || opt.isCorrect) && (
                      <div className={`mt-2 pt-2 border-t text-xs font-normal ${opt.isCorrect ? 'border-emerald-800 text-emerald-300' : 'border-red-800 text-red-300'}`}>
                        {opt.explanation}
                      </div>
                    )}
                  </div>
                  {showResult && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {showResult && isChosen && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Scenario Button */}
          {showResult && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition flex items-center space-x-1.5 font-mono text-xs"
              >
                <span>{currentIdx + 1 < SCENARIOS.length ? 'Next Scenario' : 'View Defense Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Finished Screen */
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-8 shadow-2xl text-center space-y-6">
          <div className="p-4 rounded-full bg-cyan-950/70 text-cyan-400 w-fit mx-auto border border-cyan-800">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Challenge Completed!</h2>
            <p className="text-sm text-slate-300 font-mono">
              You scored <span className="text-cyan-400 font-bold">{score} / {SCENARIOS.length}</span> correct defensive responses.
            </p>
          </div>

          <div className="p-4 bg-navy-950 rounded-xl border border-navy-800 text-xs text-slate-300 max-w-lg mx-auto text-left space-y-2">
            <div className="font-bold text-white uppercase font-mono">Key Cyber Defense Takeaways:</div>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              <li><strong>UPI PIN is only to SEND:</strong> Never scan QR codes or type PIN to receive funds.</li>
              <li><strong>No Advance Job Deposits:</strong> Legitimate employers never ask employees to recharge.</li>
              <li><strong>Verify Disconnections Independently:</strong> Official utilities send SMS from alphabetical headers.</li>
              <li><strong>Extortion Blackmail:</strong> Never pay; preserve evidence, report to 1930 and StopNCII.org.</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={resetChallenge}
              className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white rounded-lg transition flex items-center space-x-1.5 text-xs font-mono"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Challenge</span>
            </button>
            <Link
              to="/analyze"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition text-xs font-mono"
            >
              Analyze Real Scam Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
