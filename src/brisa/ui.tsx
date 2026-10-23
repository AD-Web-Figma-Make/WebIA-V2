import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Logo({ light = false, small = false }: { light?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 48 48" className={small ? "size-8" : "size-11"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: light ? "#f3b08f" : "var(--color-terracotta-500)" }} aria-hidden>
        <circle cx="24" cy="24" r="8" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={24 + Math.cos(a) * 13} y1={24 + Math.sin(a) * 13} x2={24 + Math.cos(a) * (i % 2 ? 16 : 19)} y2={24 + Math.sin(a) * (i % 2 ? 16 : 19)} />;
        })}
      </svg>
      <div className={light ? "text-white" : "text-pine-800"}>
        <div className={`font-display font-semibold leading-none tracking-tight ${small ? "text-2xl" : "text-4xl"}`}>brisa</div>
        <div className={`mt-0.5 ${small ? "text-[11px]" : "text-sm"} ${light ? "text-white/85" : "text-bark-500"}`}>camping mediterráneo</div>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Cerrar" className="absolute inset-0 bg-pine-900/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`rise relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream-50 shadow-2xl sm:rounded-3xl ${wide ? "sm:max-w-3xl" : "sm:max-w-md"}`}>
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-3.5">
          <h2 className="font-display text-lg font-semibold text-pine-800">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full text-bark-700 hover:bg-cream-200">
            <X className="size-5" />
          </button>
        </div>
        <div className="soft-scroll overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-pine-800 px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-pine-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-cream-300 disabled:text-bark-500 ${className}`}>
      {children}
    </button>
  );
}

export function OutlineButton({ children, className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-pine-800/30 bg-cream-50 px-4 text-[15px] font-semibold text-pine-800 transition hover:border-pine-800 hover:bg-white active:scale-[0.98] disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}
