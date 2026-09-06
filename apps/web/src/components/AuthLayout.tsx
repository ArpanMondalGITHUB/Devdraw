import { Sparkles, Layers, Compass } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text-primary grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-surface-container-lowest border-r border-border-subtle overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.18), transparent 45%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <span className="text-lg font-bold text-primary tracking-tight">DevDraw AI</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[32px] leading-10 font-semibold tracking-[-0.01em] text-text-primary">
            The infinite canvas built for system design.
          </h2>
          <p className="mt-4 text-text-secondary text-[16px] leading-6">
            Sketch architectures, APIs and infrastructure with technical precision — then let AI
            structure the rest.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: Sparkles, text: "AI-assisted diagram generation" },
              { icon: Layers, text: "AWS, GCP & Kubernetes component library" },
              { icon: Compass, text: "Real-time team spaces" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg glass-panel flex items-center justify-center">
                  <Icon className="w-4 h-4 text-technical-cyan" />
                </span>
                <span className="text-sm text-text-secondary">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative label-caps text-text-secondary text-[10px]">
          Engineered for developers
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-lg font-bold text-primary tracking-tight">DevDraw AI</span>
          </div>

          <div className="glass-panel rounded-xl p-6 shadow-2xl shadow-black/40">
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">{footer}</p>

        </div>
      </main>
    </div>
  );
}

export function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label-caps text-[10px] text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg bg-surface-container-lowest/70 border px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-all focus:border-technical-cyan focus:ring-2 focus:ring-technical-cyan/20 ${
          error ? "border-destructive/70" : "border-border-subtle"
        }`}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full h-11 rounded-lg bg-primary text-primary-foreground label-caps transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SocialRow() {
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="label-caps text-[10px] text-text-secondary">or</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["Google", "GitHub"].map((p) => (
          <button
            key={p}
            type="button"
            className="h-10 rounded-lg border border-border-subtle bg-surface-variant/20 text-sm text-text-secondary hover:text-text-primary hover:border-technical-cyan/40 transition-all"
          >
            {p}
          </button>
        ))}
      </div>
    </>
  );
}