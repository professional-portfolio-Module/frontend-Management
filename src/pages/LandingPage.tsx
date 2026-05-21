import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { Button } from "../components/common/Button";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container-custom h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              BM
            </div>
            <span className="text-sm font-semibold text-slate-900">Browns Maintenance</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              About
            </button>
            <Button onClick={() => navigate("/login")} size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom pt-20 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-[1.15] tracking-tight">
            Browns Company
            <br />
            <span className="text-primary-600">Maintenance Portal</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            The central hub for managing maintenance operations, work orders, team schedules, and internal communications.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/login")} size="lg">
              Sign In to Dashboard <FiArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="about" className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">System Capabilities</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Core modules available within the management platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Work Order Management</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Create, assign, and track maintenance work orders across teams with priority-based workflows.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Scheduling & Shifts</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Weekly and monthly calendar views for managing team rosters, shifts, and maintenance windows.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Team Communication</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Internal messaging and notification system for coordinating between managers, engineers, and staff.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Levels Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Levels</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Each role has a dedicated dashboard with relevant tools and data</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              {
                role: "System Administration",
                desc: "Platform configuration",
                perms: ["System configuration & settings", "Global user management", "System health & monitoring", "Global activity auditing"],
              },
              {
                role: "Management",
                desc: "Full system oversight",
                perms: ["Employee verification & onboarding", "Work order creation & assignment", "Schedule management & approval", "Activity logs & audit trail"],
              },
              {
                role: "Engineering",
                desc: "Technical operations",
                perms: ["Assigned work order tracking", "Progress updates & status changes", "Maintenance report submission", "Schedule & shift visibility"],
              },
              {
                role: "Operations Staff",
                desc: "Day-to-day coordination",
                perms: ["Personal schedule & shift view", "Internal messaging access", "Notification center", "Profile & preference management"],
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm"
              >
                <h3 className="text-base font-semibold text-slate-900 mb-1">{item.role}</h3>
                <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
                <ul className="space-y-2.5">
                  {item.perms.map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <FiCheck className="text-primary-600 flex-shrink-0 mt-0.5" size={14} />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 gradient-primary">
        <div className="container-custom text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Access the Management Dashboard</h2>
          <p className="text-sm text-white/70 mb-5">Sign in with your company credentials to get started</p>
          <Button onClick={() => navigate("/login")} variant="accent" size="lg">
            Go to Sign In <FiArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-5">
        <div className="container-custom flex items-center justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Browns Company</p>
          <p className="text-xs text-slate-600">Management System</p>
        </div>
      </footer>
    </div>
  );
};
