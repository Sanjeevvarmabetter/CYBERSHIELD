import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, PhoneCall, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAnalystOrAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy-950/95 backdrop-blur border-b border-navy-700/60 shadow-lg">
      {/* Emergency Indian Cybercrime Helpline Banner */}
      <div className="bg-gradient-to-r from-red-950 via-navy-900 to-red-950 border-b border-red-900/40 px-4 py-1.5 text-xs text-red-200 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-semibold text-red-300">CRITICAL SAFETY:</span>
            <span>Immediate Financial Cyber Fraud Helpline:</span>
            <a href="tel:1930" className="inline-flex items-center font-bold text-white bg-red-600/80 hover:bg-red-600 px-2 py-0.5 rounded transition">
              <PhoneCall className="w-3 h-3 mr-1" /> 1930
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-slate-300">
            <span>Official Portal:</span>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center"
            >
              cybercrime.gov.in <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-lg bg-navy-800 border border-cyan-500/30 group-hover:border-cyan-400 transition">
            <Shield className="w-6 h-6 text-cyber-blue group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-lg tracking-wider text-white">CYBER</span>
              <span className="font-black text-lg tracking-wider text-cyber-blue">SHIELD</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-navy-800 text-slate-400 border border-navy-700">IN</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider">DETECT • UNDERSTAND • PROTECT</p>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center space-x-1">
          {/* Public Citizen Navigation */}
          <Link
            to="/analyze"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/analyze' ? 'bg-navy-700 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            Analyze Scam
          </Link>
          <Link
            to="/phishing-check"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/phishing-check' ? 'bg-navy-700 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            Safe URL Check
          </Link>
          <Link
            to="/report"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/report' ? 'bg-red-950/70 text-red-300 border border-red-800/40' : 'text-red-400 hover:bg-red-950/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4 inline mr-1" />
            Report Incident
          </Link>
          <Link
            to="/safety-center"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/safety-center' ? 'bg-navy-700 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            Safety Guides
          </Link>
          <Link
            to="/track-status"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/track-status' ? 'bg-navy-700 text-cyan-300' : 'text-slate-300 hover:text-white hover:bg-navy-800'
            }`}
          >
            Track Status
          </Link>
          <Link
            to="/challenge"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
              location.pathname === '/challenge' ? 'bg-navy-700 text-amber-300' : 'text-amber-400 hover:text-amber-300 hover:bg-navy-800'
            }`}
          >
            Spot The Scam
          </Link>

          {/* Cyber Intelligence Console Link for Analysts/Admins */}
          {isAnalystOrAdmin && (
            <div className="pl-2 ml-2 border-l border-navy-700 flex items-center space-x-1">
              <Link
                to="/console/dashboard"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/dashboard' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/console/incidents"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/incidents' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Cases
              </Link>
              <Link
                to="/console/evidence"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/evidence' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Evidence
              </Link>
              <Link
                to="/console/fraud"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/fraud' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Fraud
              </Link>
              <Link
                to="/console/graph"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/graph' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Graph
              </Link>
              <Link
                to="/console/models"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/models' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Telemetry
              </Link>
              <Link
                to="/console/assistant"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/assistant' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Copilot
              </Link>
              <Link
                to="/console/audit"
                className={`px-2 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
                  location.pathname === '/console/audit' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-cyan-400 hover:bg-navy-800'
                }`}
              >
                Audit
              </Link>
            </div>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-navy-700">
              <div className="text-right">
                <div className="text-xs font-medium text-white">{user.full_name}</div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-red-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 rounded-md transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-medium text-navy-950 bg-cyan-400 hover:bg-cyan-300 font-semibold rounded-md shadow-sm transition"
              >
                Get Protected
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md bg-navy-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-900 border-b border-navy-700 px-4 py-4 space-y-2">
          <Link
            to="/analyze"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-navy-800"
          >
            Analyze Scam
          </Link>
          <Link
            to="/phishing-check"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-navy-800"
          >
            Safe URL Check
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-red-300 hover:bg-navy-800"
          >
            Report Incident
          </Link>
          <Link
            to="/safety-center"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-navy-800"
          >
            Safety Guides
          </Link>
          <Link
            to="/track-status"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-navy-800"
          >
            Track Status
          </Link>
          <Link
            to="/challenge"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-amber-300 hover:bg-navy-800"
          >
            Spot The Scam Challenge
          </Link>
          {isAnalystOrAdmin && (
            <div className="space-y-1 pt-2 border-t border-navy-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 px-3">Intelligence Console</div>
              <Link
                to="/console/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Dashboard
              </Link>
              <Link
                to="/console/incidents"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Incident Queue
              </Link>
              <Link
                to="/console/evidence"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Evidence Vault
              </Link>
              <Link
                to="/console/fraud"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Fraud Engine
              </Link>
              <Link
                to="/console/graph"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Graph Intelligence
              </Link>
              <Link
                to="/console/models"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Model Telemetry
              </Link>
              <Link
                to="/console/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Copilot Assistant
              </Link>
              <Link
                to="/console/audit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-1.5 rounded text-xs font-mono text-cyan-300 hover:bg-navy-800"
              >
                Audit Trail
              </Link>
            </div>
          )}
          <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-slate-300">{user.email}</span>
                <button onClick={logout} className="text-xs text-red-400 font-semibold">Logout</button>
              </div>
            ) : (
              <div className="flex space-x-2 w-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-xs bg-navy-800 rounded text-white">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-xs bg-cyan-400 text-navy-950 font-semibold rounded">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
