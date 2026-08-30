"use client";

import { createContext, useContext, useState } from "react";
import { Sidebar } from "./Sidebar";

const MobileNavContext = createContext<() => void>(() => {});

export function useMobileNav() {
  return useContext(MobileNavContext);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MobileNavContext.Provider value={() => setOpen(true)}>
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-60 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[82%] shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </MobileNavContext.Provider>
  );
}
