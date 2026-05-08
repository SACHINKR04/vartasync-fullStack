"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Users, Mic, BarChart3, Zap, Shield, Globe, ArrowRight, Phone, ChevronRight, CheckCircle, Sun, Moon } from "lucide-react"

interface Props {
  onLogin: () => void
  onNavigate?: (page: string) => void
}

function TerminalWave({ accent }: { accent: string }) {
  const [bars, setBars] = useState<{h: string, d: string}[]>([])
  useEffect(() => {
    setBars([...Array(12)].map((_, i) => ({
      h: `${8 + Math.random() * 12}px`,
      d: `${i * 0.1}s`
    })))
  }, [])
  const displayBars = bars.length ? bars : [...Array(12)].map((_, i) => ({ h: "14px", d: `${i * 0.1}s` }))
  return (
    <div className="flex flex-1 items-center justify-center gap-0.5">
      {displayBars.map((b, i) => (
        <div key={i} className="w-0.5 animate-pulse rounded-full" style={{ height: b.h, backgroundColor: accent, animationDelay: b.d }} />
      ))}
    </div>
  )
}

function MetricChart({ accent, dark }: { accent: string, dark: boolean }) {
  const [bars, setBars] = useState<string[]>([])
  useEffect(() => {
    setBars([...Array(12)].map(() => `${20 + Math.random() * 80}%`))
  }, [])
  const displayBars = bars.length ? bars : [...Array(12)].map(() => "50%")
  return (
    <div className="mt-4 flex h-8 items-end gap-1">
      {displayBars.map((h, j) => (
        <div key={j} className="flex-1 rounded-t transition-colors duration-300" style={{ height: h, backgroundColor: j > 8 ? accent : dark ? "#2a2a3a" : "#d0ddd5" }} />
      ))}
    </div>
  )
}

function StepWave({ index, dark }: { index: number, dark: boolean }) {
  const [bars, setBars] = useState<{h: string, bg: string}[]>([])
  useEffect(() => {
    setBars([...Array(20)].map((_, j) => ({
      h: `${10 + Math.sin(j * 0.5 + index) * 20 + Math.random() * 10}px`,
      bg: dark ? `rgba(0,255,136,${0.3 + Math.random() * 0.4})` : `rgba(0,180,100,${0.2 + Math.random() * 0.3})`
    })))
  }, [index, dark])
  const displayBars = bars.length ? bars : [...Array(20)].map((_, j) => ({
    h: `${10 + Math.sin(j * 0.5 + index) * 20 + 5}px`,
    bg: dark ? `rgba(0,255,136,0.5)` : `rgba(0,180,100,0.35)`
  }))
  return (
    <div className="mt-4 h-16 rounded-lg transition-colors duration-300" style={{ backgroundColor: dark ? "rgba(42,42,58,0.3)" : "rgba(0,200,100,0.05)" }}>
      <div className="flex h-full items-center justify-center gap-0.5">
        {displayBars.map((b, j) => (
          <div key={j} className="w-0.5 rounded-full" style={{ height: b.h, backgroundColor: b.bg }} />
        ))}
      </div>
    </div>
  )
}

export function LandingPage({ onLogin, onNavigate }: Props) {
  const [hoverCta, setHoverCta] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const dark = mounted ? theme === "dark" : true

  const t = {
    bg: dark ? "#0a0a0f" : "#f8faf9",
    bgCard: dark ? "rgba(18,18,26,0.8)" : "rgba(255,255,255,0.9)",
    bgCardHover: dark ? "rgba(0,255,136,0.1)" : "rgba(0,200,100,0.05)",
    border: dark ? "#2a2a3a" : "#e0e8e4",
    borderHover: dark ? "rgba(0,255,136,0.3)" : "rgba(0,180,100,0.4)",
    text: dark ? "#e5e5e5" : "#1a2e22",
    textMuted: dark ? "#6b6b7b" : "#5a6b62",
    accent: "#00ff88",
    accentDark: "#00cc6a",
    accentBg: dark ? "rgba(0,255,136,0.1)" : "rgba(0,200,100,0.1)",
    accentGlow: dark ? "0 0 30px rgba(0,255,136,0.4)" : "0 0 20px rgba(0,200,100,0.25)",
    accentGlowStrong: dark ? "0 0 40px rgba(0,255,136,0.5)" : "0 0 25px rgba(0,200,100,0.35)",
    gradientFrom: dark ? "#12121a" : "#ffffff",
    gradientTo: dark ? "#0d0d14" : "#f0f5f2",
    dotOpacity: dark ? "0.4" : "0.2",
    orbOpacity: dark ? "0.05" : "0.08",
    waveformBg: dark ? "#1a1a24" : "#e8f0eb",
    terminalBg: dark ? "#0a0a0f" : "#f5f8f6",
    purple: dark ? "rgba(30,27,75,0.6)" : "rgba(230,225,255,0.8)",
  }

  return (
    <div className="relative min-h-screen overflow-hidden transition-colors duration-500" style={{ backgroundColor: t.bg }}>
      <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-3xl transition-opacity duration-500" style={{ backgroundColor: t.accent, opacity: parseFloat(t.orbOpacity) }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl transition-opacity duration-500" style={{ backgroundColor: t.accent, opacity: parseFloat(t.orbOpacity) * 0.6 }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-500" style={{ backgroundColor: t.accent, opacity: parseFloat(t.orbOpacity) * 0.8 }} />

      {dark && <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjMmEyYTNhIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvZz48L3N2Zz4=')] opacity-40" />}

      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-shadow duration-300" style={{ backgroundColor: t.accent, boxShadow: t.accentGlow }}>
              <Users className="h-6 w-6" style={{ color: dark ? "#0a0a0f" : "#0a0a0f" }} />
            </div>
            <span className="text-2xl font-bold transition-colors duration-300" style={{ color: t.text }}>VartaSync</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Features</a>
            <button onClick={() => onNavigate?.("pricing")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Pricing</button>
            <button onClick={() => onNavigate?.("resources")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Resources</button>
            <button onClick={() => onNavigate?.("contact")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Contact Sales</button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(dark ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105"
              style={{ borderColor: t.border, backgroundColor: t.bgCard }}
            >
              {dark ? <Sun className="h-5 w-5" style={{ color: t.accent }} /> : <Moon className="h-5 w-5" style={{ color: t.textMuted }} />}
            </button>
            <button
              onClick={onLogin}
              className="rounded-xl px-6 py-2.5 font-semibold transition-all duration-300"
              style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:pb-24 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors duration-300" style={{ borderColor: dark ? "rgba(0,255,136,0.2)" : "rgba(0,180,100,0.3)", backgroundColor: t.accentBg }}>
                <div className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: t.accent }} />
                <span className="text-sm" style={{ color: t.accent }}>AI-Powered Voice Intelligence</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight transition-colors duration-300 md:text-5xl lg:text-6xl" style={{ color: t.text }}>
                <span className="text-balance">Orchestrate Every Voice</span>
                <br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${t.accent}, ${t.accentDark})`, textShadow: dark ? "0 0 60px rgba(0,255,136,0.3)" : "none" }}>
                  Conversation
                </span>
              </h1>
              <p className="mb-10 max-w-xl text-lg leading-relaxed transition-colors duration-300" style={{ color: t.textMuted }}>
                VartaSync is a low-latency agentic voice orchestrator that monitors, analyzes, and optimizes your sales calls in real-time with AI-powered intelligence.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onLogin}
                  onMouseEnter={() => setHoverCta(true)}
                  onMouseLeave={() => setHoverCta(false)}
                  className="group flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-bold transition-all duration-300"
                  style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: hoverCta ? t.accentGlowStrong : t.accentGlow }}
                >
                  Enter Terminal
                  <ArrowRight className={`h-5 w-5 transition-transform ${hoverCta ? "translate-x-1" : ""}`} />
                </button>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm" style={{ color: t.textMuted }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" style={{ color: t.accent }} />
                  <span>99.5% Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: t.accent }} />
                  <span>Sub-100ms Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" style={{ color: t.accent }} />
                  <span>24/7 Availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" style={{ color: t.accent }} />
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl" style={{ backgroundColor: t.accent }} />
              <div className="relative overflow-hidden rounded-2xl border p-1 backdrop-blur-xl transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard, boxShadow: dark ? "0 0 60px rgba(0,255,136,0.1)" : "0 20px 60px rgba(0,0,0,0.1)" }}>
                <div className="flex items-center gap-2 border-b px-4 py-3 transition-colors duration-300" style={{ borderColor: t.border }}>
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <span className="ml-4 text-sm" style={{ color: t.textMuted }}>VartaSync Terminal</span>
                </div>
                <div className="aspect-[4/3] p-4 transition-colors duration-300" style={{ backgroundColor: t.terminalBg }}>
                  <div className="grid h-full grid-cols-3 gap-3">
                    <div className="space-y-2 rounded-xl border p-3 transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: t.textMuted }}>Live Conversations</span>
                        <span className="text-xs" style={{ color: t.accent }}>12 Active</span>
                      </div>
                      {["Arjun Mehta", "Priya Sharma", "Vikram Singh", "Neha Patel", "Mohit Bansal"].map((name, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg p-2 transition-colors duration-300" style={{ backgroundColor: dark ? "rgba(42,42,58,0.3)" : "rgba(0,200,100,0.05)" }}>
                          <div className="h-6 w-6 rounded-full" style={{ backgroundColor: t.accentBg }} />
                          <div className="flex-1">
                            <div className="text-xs font-medium" style={{ color: t.text }}>{name}</div>
                            <div className="text-[10px]" style={{ color: t.textMuted }}>02:{30 + i * 5}</div>
                          </div>
                          <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: i === 0 ? "rgba(0,255,136,0.2)" : i === 4 ? "rgba(255,200,50,0.2)" : "rgba(100,100,255,0.2)", color: i === 0 ? t.accent : i === 4 ? "#ffcc00" : "#8888ff" }}>
                            {i === 0 ? "In Progress" : i === 4 ? "On Hold" : "Analyzing"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 rounded-xl border p-3 transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: t.textMuted }}>Live Transcript</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: t.accent }} />
                          <span className="text-[10px]" style={{ color: t.accent }}>Live</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-[10px]">
                        <div className="rounded-lg p-2" style={{ backgroundColor: dark ? "rgba(255,100,100,0.1)" : "rgba(255,100,100,0.08)" }}>
                          <span className="font-medium" style={{ color: "#ff6b6b" }}>Lead</span>
                          <span className="ml-2" style={{ color: t.textMuted }}>10:32 AM</span>
                          <p className="mt-1" style={{ color: t.text }}>I already work with another broker.</p>
                        </div>
                        <div className="rounded-lg p-2" style={{ backgroundColor: dark ? "rgba(0,200,255,0.1)" : "rgba(0,150,200,0.08)" }}>
                          <span className="font-medium" style={{ color: "#00ccff" }}>AI Agent</span>
                          <span className="ml-2" style={{ color: t.textMuted }}>10:32 AM</span>
                          <p className="mt-1" style={{ color: t.text }}>Understood sir! But with Rupeezy, you get 100% brokerage share and daily payouts.</p>
                        </div>
                        <div className="rounded-lg p-2" style={{ backgroundColor: dark ? "rgba(255,100,100,0.1)" : "rgba(255,100,100,0.08)" }}>
                          <span className="font-medium" style={{ color: "#ff6b6b" }}>Lead</span>
                          <span className="ml-2" style={{ color: t.textMuted }}>10:33 AM</span>
                          <p className="mt-1" style={{ color: t.text }}>That sounds interesting. Tell me more.</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: t.accentBg }}>
                          <Mic className="h-3 w-3" style={{ color: t.accent }} />
                          <span className="text-[10px]" style={{ color: t.accent }}>Listening...</span>
                        </div>
                        <TerminalWave accent={t.accent} />
                      </div>
                    </div>
                    <div className="space-y-3 rounded-xl border p-3 transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                      <span className="text-xs font-medium" style={{ color: t.textMuted }}>Conversation Insights</span>
                      <div className="flex items-center justify-center">
                        <div className="relative flex h-20 w-20 items-center justify-center">
                          <svg className="h-full w-full -rotate-90">
                            <circle cx="40" cy="40" r="32" fill="none" stroke={dark ? "#2a2a3a" : "#e0e8e4"} strokeWidth="6" />
                            <circle cx="40" cy="40" r="32" fill="none" stroke={t.accent} strokeWidth="6" strokeDasharray="201" strokeDashoffset="26" strokeLinecap="round" style={{ filter: dark ? "drop-shadow(0 0 6px rgba(0,255,136,0.5))" : "none" }} />
                          </svg>
                          <div className="absolute text-center">
                            <div className="text-lg font-bold" style={{ color: t.accent }}>87%</div>
                            <div className="text-[8px]" style={{ color: t.textMuted }}>Lead Score</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between"><span style={{ color: t.textMuted }}>Duration</span><span style={{ color: t.text }}>02:34</span></div>
                        <div className="flex items-center justify-between"><span style={{ color: t.textMuted }}>Sentiment</span><span style={{ color: t.accent }}>Positive</span></div>
                        <div className="flex items-center justify-between"><span style={{ color: t.textMuted }}>Objections</span><span style={{ color: t.text }}>1</span></div>
                        <div className="flex items-center justify-between"><span style={{ color: t.textMuted }}>Intent</span><span style={{ color: t.accent }}>High</span></div>
                      </div>
                      <button className="w-full rounded-lg py-2 text-xs font-semibold transition-all duration-300" style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}>
                        Take Over Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y py-8 transition-colors duration-300" style={{ borderColor: t.border, background: `linear-gradient(to right, ${t.gradientTo}, ${t.gradientFrom}, ${t.gradientTo})` }}>
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-12 px-6">
            <div className="flex items-center gap-2 text-sm" style={{ color: t.textMuted }}>
              <Shield className="h-4 w-4" style={{ color: t.accent }} />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: t.textMuted }}>
              <CheckCircle className="h-4 w-4" style={{ color: t.accent }} />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: t.textMuted }}>
              <CheckCircle className="h-4 w-4" style={{ color: t.accent }} />
              <span>GDPR Ready</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-sm" style={{ color: t.textMuted }}>vs. Previous Quarter</span>
            </div>
            <h2 className="text-2xl font-bold transition-colors duration-300 md:text-3xl" style={{ color: t.text }}>Our Key Performance Metrics</h2>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard, color: t.textMuted }}>
              This Month
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { value: "40%", sub: "+8%", label: "Cost Reduction", sublabel: "↑ vs last month" },
              { value: "87%", sub: "+12%", label: "Conversion Rate", sublabel: "↑ vs last month" },
              { value: "24/7", sub: "", label: "Availability", sublabel: "Always online" },
              { value: "<100ms", sub: "", label: "Response Time", sublabel: "Ultra low latency" },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl border p-6 transition-all duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" style={{ color: t.accent, textShadow: dark ? "0 0 20px rgba(0,255,136,0.3)" : "none" }}>{stat.value}</span>
                  {stat.sub && <span className="text-sm" style={{ color: t.accent }}>{stat.sub}</span>}
                </div>
                <div className="mt-1 text-sm font-medium" style={{ color: t.text }}>{stat.label}</div>
                <div className="mt-0.5 text-xs" style={{ color: t.textMuted }}>{stat.sublabel}</div>
                  <MetricChart accent={t.accent} dark={dark} />
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold transition-colors duration-300 md:text-3xl" style={{ color: t.text }}>Powerful Features</h2>
            <p className="mx-auto max-w-2xl" style={{ color: t.textMuted }}>
              Everything you need to transform your voice communications into actionable insights.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Mic, title: "Real-Time Transcription", desc: "Live speech-to-text with Hinglish support. Watch conversations unfold as they happen with 99%+ accuracy." },
              { icon: BarChart3, title: "Conversion Analytics", desc: "AI-powered lead scoring and conversion probability tracking. Know exactly when to take over a call." },
              { icon: Zap, title: "Low-Latency Processing", desc: "Sub-100ms response times ensure your AI agent never misses a beat in fast-paced conversations." },
              { icon: Shield, title: "Objection Tracking", desc: "Automatic detection and categorization of customer objections with AI-powered resolution suggestions." },
              { icon: Phone, title: "Seamless Handoff", desc: "One-click transition from AI to human agent with full context preservation and conversation history." },
              { icon: Globe, title: "Multi-Language Support", desc: "Native support for English, Hindi, and Hinglish with automatic language detection and adaptation." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:border-opacity-60" style={{ borderColor: t.border, backgroundColor: t.bgCard }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.boxShadow = dark ? "0 0 40px rgba(0,255,136,0.1)" : "0 10px 40px rgba(0,0,0,0.08)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = "none" }}>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300" style={{ backgroundColor: t.accentBg, boxShadow: dark ? "0 0 20px rgba(0,255,136,0.15)" : "none" }}>
                  <Icon className="h-7 w-7" style={{ color: t.accent }} />
                </div>
                <h3 className="mb-3 text-xl font-bold transition-colors duration-300" style={{ color: t.text }}>{title}</h3>
                <p className="leading-relaxed" style={{ color: t.textMuted }}>{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: t.accent }}>
                  Learn more <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold transition-colors duration-300 md:text-3xl" style={{ color: t.text }}>How It Works</h2>
            <p className="mx-auto max-w-2xl" style={{ color: t.textMuted }}>
              From lead to conversion in four intelligent steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Lead Identification", desc: "AI analyzes incoming calls and categorizes leads by intent, urgency, and potential value." },
              { step: "02", title: "Real-Time Engagement", desc: "Voice agent handles the conversation with natural language processing and sentiment analysis." },
              { step: "03", title: "Objection Handling", desc: "Automatic detection of objections with AI-suggested responses and resolution tracking." },
              { step: "04", title: "Smart Handoff", desc: "Seamless transition to human agents at critical moments with full conversation context." },
            ].map((item, i) => (
              <div key={i} className="relative rounded-2xl border p-6 transition-all duration-300" style={{ borderColor: t.border, backgroundColor: t.bgCard }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300" style={{ backgroundColor: t.accent, boxShadow: t.accentGlow }}>
                  <span className="text-lg font-bold" style={{ color: "#0a0a0f" }}>{item.step}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: t.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.textMuted }}>{item.desc}</p>
                <StepWave index={i} dark={dark} />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-3xl border p-12 text-center transition-colors duration-300 md:p-16" style={{ borderColor: t.border, backgroundColor: t.bgCard, boxShadow: dark ? "0 0 80px rgba(0,255,136,0.08)" : "0 20px 60px rgba(0,0,0,0.06)" }}>
            <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: t.accent, opacity: 0.1 }} />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: t.accent, opacity: 0.1 }} />
            <div className="relative">
              <h2 className="mb-4 text-2xl font-bold transition-colors duration-300 md:text-3xl" style={{ color: t.text }}>Ready to Transform Your Sales Team?</h2>
              <p className="mx-auto mb-8 max-w-xl" style={{ color: t.textMuted }}>
                Experience the future of sales intelligence and conversion, powered by real-time voice orchestration and AI-powered insights.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button onClick={onLogin} className="group inline-flex items-center gap-3 rounded-xl px-8 py-3 font-semibold transition-all duration-300" style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}>
                  Access Terminal
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2" style={{ borderColor: t.bg, backgroundColor: `hsl(${150 + i * 20}, 50%, ${dark ? 30 : 70}%)` }} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: t.textMuted }}>Join 300+ sales teams already transforming their conversations</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-8 transition-colors duration-300" style={{ borderColor: t.border }}>
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-6 text-center text-sm" style={{ color: t.textMuted }}>Trusted by forward-thinking sales teams across India</p>
            <div className="flex flex-wrap items-center justify-center gap-12">
              {["Rupeezy", "ShareIndia", "FYERS", "aliceblue", "upstox"].map((name, i) => (
                <div key={i} className="text-xl font-bold transition-colors duration-300" style={{ color: t.textMuted, opacity: 0.6 }}>{name}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 transition-colors duration-300" style={{ borderColor: t.border }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: t.accent }}>
                  <Users className="h-5 w-5" style={{ color: "#0a0a0f" }} />
                </div>
                <span className="text-lg font-bold" style={{ color: t.text }}>VartaSync</span>
              </div>
              <p className="text-sm" style={{ color: t.textMuted }}>2024 VartaSync. AI-Powered Voice Intelligence. All rights reserved.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Resources"] },
              { title: "Company", links: ["About Us", "Careers", "Blog"] },
              { title: "Support", links: ["Contact Sales", "Documentation", "Help Center"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="mb-3 text-sm font-semibold" style={{ color: t.text }}>{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-sm transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
