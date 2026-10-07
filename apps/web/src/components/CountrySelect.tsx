"use client";

import type { Country } from "@global-market/shared";
import { COUNTRIES } from "@global-market/shared";
import { useEffect, useRef, useState } from "react";

interface Props {
  mode: "country" | "dial";
  value: string;
  placeholder: string;
  onSelect: (country: Country) => void;
  className?: string;
}

export function CountrySelect({ mode, value, placeholder, onSelect, className }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = COUNTRIES.find((c) => (mode === "country" ? c.code === value : c.dial === value));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          className ??
          "w-full flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2.5 bg-white text-left focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
        }
      >
        {selected ? (
          <>
            <span className={`fi fi-${selected.code.toLowerCase()} rounded-sm`} />
            <span className="text-neutral-900">{mode === "country" ? selected.name : selected.dial}</span>
          </>
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
        <svg className="ml-auto w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-white shadow-lg py-1">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onSelect(c);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-emerald-50 transition-colors"
            >
              <span className={`fi fi-${c.code.toLowerCase()} rounded-sm`} />
              <span className="text-neutral-900">{mode === "country" ? c.name : c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
