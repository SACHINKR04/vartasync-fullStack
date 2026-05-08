"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Users, Sun, Moon, Mail, Phone, Calendar, Zap, MessageSquare, Settings, ArrowRight, CheckCircle } from "lucide-react"

interface Props {
  onBack: () => void
  onLogin: () => void
  onNavigate: (page: string) => void
}

export function ContactPage({ onBack, onLogin, onNavigate }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dark = mounted ? theme === "dark" : true

  const t = {
    bg: dark ? "#0a0a0f" : "#f8faf9",
    bgCard: dark ? "rgba(18,18,26,0.8)" : "rgba(255,255,255,0.95)",
    border: dark ? "#2a2a3a" : "#e0e8e4",
    text: dark ? "#e5e5e5" : "#1a2e22",
    textMuted: dark ? "#6b6b7b" : "#5a6b62",
    accent: "#00ff88",
    accentDark: "#00cc6a",
    accentBg: dark ? "rgba(0,255,136,0.1)" : "rgba(0,200,100,0.1)",
    accentGlow: dark ? "0 0 30px rgba(0,255,136,0.4)" : "0 0 20px rgba(0,200,100,0.25)",
    inputBg: dark ? "rgba(26,26,36,0.8)" : "rgba(255,255,255,0.9)",
  }

  const benefits = [
    { icon: Zap, title: "Personalized Demo", desc: "See VartaSync in action with a custom demo tailored to your needs." },
    { icon: MessageSquare, title: "Expert Consultation", desc: "Get expert advice on how VartaSync can transform your sales calls." },
    { icon: Settings, title: "Custom Solutions", desc: "We'll help you build a solution that fits your unique business requirements." },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-500" style={{ backgroundColor: t.bg }}>
      <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-3xl transition-opacity duration-500" style={{ backgroundColor: t.accent, opacity: dark ? 0.05 : 0.08 }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl transition-opacity duration-500" style={{ backgroundColor: t.accent, opacity: dark ? 0.03 : 0.05 }} />

      {dark && <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjMmEyYTNhIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-40" />}

      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-shadow duration-300" style={{ backgroundColor: t.accent, boxShadow: t.accentGlow }}>
              <Users className="h-6 w-6" style={{ color: "#0a0a0f" }} />
            </div>
            <span className="text-2xl font-bold transition-colors duration-300" style={{ color: t.text }}>VartaSync</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <button onClick={onBack} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Features</button>
            <button onClick={() => onNavigate("pricing")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Pricing</button>
            <button onClick={() => onNavigate("resources")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Resources</button>
            <button className="transition-colors duration-300" style={{ color: t.accent }}>Contact Sales</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(dark ? "light" : "dark")} className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
              {dark ? <Sun className="h-5 w-5" style={{ color: t.accent }} /> : <Moon className="h-5 w-5" style={{ color: t.textMuted }} />}
            </button>
            <button onClick={onLogin} className="rounded-xl px-6 py-2.5 font-semibold transition-all duration-300" style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}>
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-300" style={{ borderColor: dark ? "rgba(0,255,136,0.2)" : "rgba(0,180,100,0.3)", backgroundColor: t.accentBg }}>
            <div className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: t.accent }} />
            <span className="text-sm" style={{ color: t.accent }}>Let&apos;s Talk</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl" style={{ color: t.text }}>
            Get in touch with our<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${t.accent}, ${t.accentDark})` }}>sales team</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg" style={{ color: t.textMuted }}>
            We&apos;ll help you find the perfect solution for your business. Fill out the form below and we&apos;ll get back to you soon.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.01]"
                  style={{ borderColor: t.border, backgroundColor: t.bgCard, boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: t.accentBg }}>
                    <Icon className="h-6 w-6" style={{ color: t.accent }} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold" style={{ color: t.text }}>{b.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: t.textMuted }}>{b.desc}</p>
                  </div>
                </div>
              )
            })}

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold" style={{ color: t.text }}>Other ways to reach us</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                  <Mail className="mx-auto mb-2 h-5 w-5" style={{ color: t.accent }} />
                  <div className="text-xs font-semibold mb-1" style={{ color: t.text }}>Email</div>
                  <div className="text-xs" style={{ color: t.textMuted }}>sales@vartasync.com</div>
                </div>
                <div className="rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                  <Phone className="mx-auto mb-2 h-5 w-5" style={{ color: t.accent }} />
                  <div className="text-xs font-semibold mb-1" style={{ color: t.text }}>Phone</div>
                  <div className="text-xs" style={{ color: t.textMuted }}>+1 (888) 123-4567</div>
                </div>
                <div className="rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                  <Calendar className="mx-auto mb-2 h-5 w-5" style={{ color: t.accent }} />
                  <div className="text-xs font-semibold mb-1" style={{ color: t.text }}>Schedule a Call</div>
                  <div className="text-xs" style={{ color: t.textMuted }}>Book a time with us</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-8 transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard, boxShadow: dark ? "0 4px 30px rgba(0,0,0,0.4)" : "0 4px 30px rgba(0,0,0,0.08)" }}>
            <h2 className="mb-6 text-xl font-bold" style={{ color: t.text }}>Send us a message</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.text }}>Full Name</label>
                <input type="text" placeholder="Enter your full name" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-300 focus:ring-2" style={{ borderColor: t.border, backgroundColor: t.inputBg, color: t.text, "--tw-ring-color": t.accent } as React.CSSProperties} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.text }}>Work Email</label>
                <input type="email" placeholder="Enter your work email" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-300 focus:ring-2" style={{ borderColor: t.border, backgroundColor: t.inputBg, color: t.text } as React.CSSProperties} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.text }}>Company Name</label>
                <input type="text" placeholder="Enter your company name" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-300 focus:ring-2" style={{ borderColor: t.border, backgroundColor: t.inputBg, color: t.text } as React.CSSProperties} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: t.text }}>Message</label>
                <textarea rows={4} placeholder="Tell us about your requirements..." className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors duration-300 focus:ring-2" style={{ borderColor: t.border, backgroundColor: t.inputBg, color: t.text } as React.CSSProperties} />
              </div>
              <button type="submit" className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
