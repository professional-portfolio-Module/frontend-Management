import React from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpen, children }) => {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary-600 text-white lg:hidden"
      >
        <FiMenu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none lg:z-auto overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-6 lg:hidden">
          <h2 className="text-xl font-bold text-primary-600">Menu</h2>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
};

interface SidebarNavProps {
  items: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
    badge?: number;
    active?: boolean;
  }[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ items }) => {
  return (
    <nav className="space-y-2 px-4 py-6">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href || "#"}
          onClick={item.onClick}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
            item.active
              ? "bg-primary-100 text-primary-600 font-semibold"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
};
