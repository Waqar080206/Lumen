"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface NavProps {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeSection: string;
  navItems: NavItem[];
  navigateToSection: (id: string) => void;
}

export default function Nav({
  expanded,
  setExpanded,
  activeSection,
  navItems,
  navigateToSection,
}: NavProps) {
  return (
    <aside
      className={[
        "hidden md:flex flex-col shrink-0 border-r border-white/5 bg-[#171717] transition-all duration-200",
        expanded ? "w-64" : "w-16",
      ].join(" ")}
    >
      {/* Header */}

      <div className="flex h-14 items-center px-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {expanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </button>

        {expanded && (
          <span className="ml-3 text-sm font-medium text-white">
            Lumen
          </span>
        )}
      </div>

    
      {/* Navigation */}

      <div className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navigateToSection(id)}
            className={[
              "flex h-10 items-center rounded-lg px-3 text-sm transition-colors",
              activeSection === id
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />

            {expanded && (
              <span className="ml-3 truncate">
                {label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Spacer */}

      <div className="flex-1" />

    </aside>
  );
}