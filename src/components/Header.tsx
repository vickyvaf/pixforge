import React from "react";
import { CreditDisplay } from "../features/credits/CreditDisplay";

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            PixForge
          </span>
        </div>

        <CreditDisplay />
      </div>
    </header>
  );
};
