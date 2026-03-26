"use client";

import { User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-eden-surface border-b border-eden-border flex items-center justify-end px-6">
      {/* User Avatar */}
      <button className="w-9 h-9 rounded-full bg-eden-bg-subtle border border-eden-border flex items-center justify-center hover:border-eden-border-strong transition-colors">
        <User className="w-5 h-5 text-eden-text-secondary" />
      </button>
    </header>
  );
}
