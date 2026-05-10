import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Button } from "../components/common/Button";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📋",
      title: "Work Management",
      description: "Efficiently track and manage maintenance tasks",
    },
    {
      icon: "📅",
      title: "Schedule Planning",
      description: "Organize and coordinate team schedules",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Communicate with team members seamlessly",
    },
    {
      icon: "📊",
      title: "Analytics & Reports",
      description: "Track performance and generate insights",
    },
    {
      icon: "🔔",
      title: "Notifications",
      description: "Stay updated with real-time alerts",
    },
    {
      icon: "🛡️",
      title: "Role-Based Access",
      description: "Secure access control for different roles",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
              BM
            </div>
            <h1 className="text-2xl font-bold text-primary-600">Browns Maintenance</h1>
          </div>
          <Button onClick={() => navigate("/login")}>
            Login <FiArrowRight />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-custom py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Maintenance Management <span className="text-primary-600">Made Simple</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your maintenance operations with our comprehensive management system.
              Track work items, manage schedules, and collaborate with your team effortlessly.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/login")} size="lg">
                Get Started <FiArrowRight />
              </Button>
              <Button onClick={() => navigate("/login")} variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage maintenance operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Role-Based Access</h2>
            <p className="text-xl text-gray-600">Tailored experience for each role</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: "Manager",
                perms: ["Employee verification", "Work assignment", "Schedule management", "System logs"],
                color: "blue",
              },
              {
                role: "Engineer",
                perms: ["View work items", "Update progress", "Check schedule", "Submit reports"],
                color: "green",
              },
              {
                role: "Staff Member",
                perms: ["View schedule", "Check messages", "View notifications", "Update profile"],
                color: "purple",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.role}</h3>
                <ul className="space-y-3">
                  {item.perms.map((perm, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
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
      <section className="py-20 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join Browns Company maintenance management system today</p>
          <Button onClick={() => navigate("/login")} variant="accent" size="lg">
            Login Now <FiArrowRight />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container-custom text-center">
          <p>&copy; 2024 Browns Company. All rights reserved. <span className="text-xs opacity-50 ml-2">v1.0.1</span></p>
        </div>
      </footer>
    </div>
  );
};
