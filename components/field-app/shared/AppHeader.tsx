"use client";

import Link from "next/link";
import { Award, BarChart2, Info, Lightbulb, LogOut, Sparkles } from "lucide-react";
import { HomeShineLogo } from "@/components/homeshine-logo";
import type { Session } from "@/components/field-app/types";

export function AppHeader({ session, onLogout }: { session: Session | null; onLogout: () => void }) {
  return (
    <header className="hs-app-header">
      <div className="hs-app-header-inner">
        <Link href="/" className="hs-brand">
          <HomeShineLogo size={48} />
          <span>
            <strong>HomeSHINE</strong>
            <small>Field app</small>
          </span>
        </Link>

        <nav className="hs-nav" aria-label="App navigation">
          <Link href="/promos">
            <Sparkles size={16} />
            <span>Promos</span>
          </Link>
          <Link href="/about">
            <Info size={16} />
            <span>About</span>
          </Link>
          {session?.id === "steven" && (
            <>
              <Link href="/certificate">
                <Award size={16} />
                <span>Certificate</span>
              </Link>
              <Link href="/market">
                <BarChart2 size={16} />
                <span>Market</span>
              </Link>
            </>
          )}
          {session?.id === "beth" && (
            <Link href="/reasoning">
              <Lightbulb size={16} />
              <span>Plans</span>
            </Link>
          )}
        </nav>

        {session && (
          <div className="hs-user-chip">
            <span>{session.name}</span>
            <button type="button" onClick={onLogout} aria-label="Log out" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
