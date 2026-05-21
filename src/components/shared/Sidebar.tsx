import React from "react";
import { FiMenu, FiX } from "react-icons/fi";

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
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:shadow-xl hover:bg-primary-700 lg:hidden transition-all duration-200 active:scale-95"
      >
        <FiMenu size={22} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden transition-opacity duration-300 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200/80 transform transition-transform duration-300 ease-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto overflow-y-auto scrollbar-thin`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              BM
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">Browns</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Maintenance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <FiX size={18} className="text-slate-400" />
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
    <nav className="px-3 py-4">
      <div className="space-y-0.5">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href || "#"}
            onClick={item.onClick}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 group ${
              item.active
                ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600 ml-0"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-base ${item.active ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
};
