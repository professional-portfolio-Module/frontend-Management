import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiShield, FiActivity, FiUsers } from "react-icons/fi";
import { Button } from "../components/common/Button";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiActivity className="w-5 h-5" />,
      title: "Work Management",
      description: "Track and manage maintenance tasks with real-time status updates and priority workflows.",
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      title: "Team Collaboration",
      description: "Coordinate across teams with built-in messaging, notifications, and schedule management.",
    },
    {
      icon: <FiShield className="w-5 h-5" />,
      title: "Role-Based Access",
      description: "Secure access control with dedicated dashboards for managers, engineers, and staff.",
    },
  ];

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
          <Button onClick={() => navigate("/login")} size="sm">
            Sign In <FiArrowRight size={14} />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom pt-20 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium mb-6 ring-1 ring-inset ring-primary-700/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Professional Maintenance Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-5 leading-[1.15] tracking-tight">
            Maintenance Management
            <br />
            <span className="text-primary-600">Made Simple</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Streamline your maintenance operations with our comprehensive management system. Track work items, manage schedules, and collaborate effortlessly.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/login")} size="lg">
              Get Started <FiArrowRight size={16} />
            </Button>
            <Button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              variant="secondary"
              size="lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Powerful Features</h2>
            <p className="text-sm text-slate-600">Everything you need to manage maintenance operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Built for Every Role</h2>
            <p className="text-sm text-slate-600">Tailored dashboards for each team member</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                role: "Manager",
                icon: "👔",
                perms: ["Employee verification", "Work assignment", "Schedule management", "System logs"],
              },
              {
                role: "Engineer",
                icon: "⚙️",
                perms: ["View work items", "Update progress", "Check schedule", "Submit reports"],
              },
              {
                role: "Staff Member",
                icon: "👤",
                perms: ["View schedule", "Check messages", "View notifications", "Update profile"],
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-base font-semibold text-slate-900">{item.role}</h3>
                </div>
                <ul className="space-y-2.5">
                  {item.perms.map((perm, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
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
      <section className="py-16 gradient-primary">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-sm text-white/80 mb-6">Join Browns Company maintenance management system today</p>
          <Button onClick={() => navigate("/login")} variant="accent" size="lg">
            Sign In <FiArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-6">
        <div className="container-custom text-center">
          <p className="text-xs text-slate-500">
            © 2024 Browns Company. All rights reserved.
            <span className="ml-2 text-slate-600">v1.0.1</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
