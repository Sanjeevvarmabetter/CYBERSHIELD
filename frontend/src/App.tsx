import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/citizen/Home';
import { ScamAnalyzer } from './pages/citizen/ScamAnalyzer';
import { PhishingChecker } from './pages/citizen/PhishingChecker';
import { ReportIncident } from './pages/citizen/ReportIncident';
import { SafetyCenter } from './pages/citizen/SafetyCenter';
import { TrackStatus } from './pages/citizen/TrackStatus';
import { ScamChallenge } from './pages/citizen/ScamChallenge';
import { Login } from './pages/citizen/Login';
import { Register } from './pages/citizen/Register';
import { ConsoleDashboard } from './pages/console/Dashboard';
import { IncidentQueue } from './pages/console/IncidentQueue';
import { FraudAnalytics } from './pages/console/FraudAnalytics';
import { GraphView } from './pages/console/GraphView';
import { AuditLogs } from './pages/console/AuditLogs';
import { EvidenceManager } from './pages/console/EvidenceManager';
import { ModelTelemetry } from './pages/console/ModelTelemetry';
import { CopilotWorkspace } from './pages/console/CopilotWorkspace';

const ProtectedConsoleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAnalystOrAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAnalystOrAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#070C18] text-slate-100 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Citizen Portal Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/analyze" element={<ScamAnalyzer />} />
              <Route path="/phishing-check" element={<PhishingChecker />} />
              <Route path="/report" element={<ReportIncident />} />
              <Route path="/safety-center" element={<SafetyCenter />} />
              <Route path="/track-status" element={<TrackStatus />} />
              <Route path="/challenge" element={<ScamChallenge />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Cyber Intelligence Console Routes */}
              <Route
                path="/console/dashboard"
                element={
                  <ProtectedConsoleRoute>
                    <ConsoleDashboard />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/incidents"
                element={
                  <ProtectedConsoleRoute>
                    <IncidentQueue />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/evidence"
                element={
                  <ProtectedConsoleRoute>
                    <EvidenceManager />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/fraud"
                element={
                  <ProtectedConsoleRoute>
                    <FraudAnalytics />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/graph"
                element={
                  <ProtectedConsoleRoute>
                    <GraphView />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/models"
                element={
                  <ProtectedConsoleRoute>
                    <ModelTelemetry />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/assistant"
                element={
                  <ProtectedConsoleRoute>
                    <CopilotWorkspace />
                  </ProtectedConsoleRoute>
                }
              />
              <Route
                path="/console/audit"
                element={
                  <ProtectedConsoleRoute>
                    <AuditLogs />
                  </ProtectedConsoleRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <footer className="bg-navy-950 border-t border-navy-800/80 py-8 text-xs text-slate-400">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-wider">CYBERSHIELD</span>
                <span>• Digital Crime Prevention & Intelligence</span>
              </div>
              <div className="text-center md:text-right space-y-1">
                <div>For official cybercrime filing: Dial <strong>1930</strong> or visit <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">cybercrime.gov.in</a></div>
                <div className="text-[11px] text-slate-400">Privacy-First Architecture • Zero-Trust URL Egress • Forensic Hashing Integrity</div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
