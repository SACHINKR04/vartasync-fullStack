"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Users, Sun, Moon, Search, BookOpen, FileText, Code, Video, BarChart3, HelpCircle, ArrowRight, ExternalLink } from "lucide-react"

interface Props {
  onBack: () => void
  onLogin: () => void
  onNavigate: (page: string) => void
}

export function ResourcesPage({ onBack, onLogin, onNavigate }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

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

  const tabs = [
    { id: "all", label: "All", icon: BookOpen },
    { id: "guides", label: "Guides", icon: BookOpen },
    { id: "docs", label: "Documentation", icon: FileText },
    { id: "api", label: "API", icon: Code },
    { id: "webinars", label: "Webinars", icon: Video },
    { id: "cases", label: "Case Studies", icon: BarChart3 },
  ]

  const resources = [
    { cat: "guides", icon: BookOpen, color: "#00ff88", title: "Getting Started Guide", desc: "Learn the basics and set up VartaSync in minutes.", tag: "Beginner" },
    { cat: "docs", icon: Code, color: "#6366f1", title: "API Documentation", desc: "Explore our API and build powerful integrations.", tag: "Developer" },
    { cat: "cases", icon: BarChart3, color: "#f59e0b", title: "Best Practices", desc: "Optimize your voice campaigns for better results.", tag: "Advanced" },
    { cat: "webinars", icon: Video, color: "#ef4444", title: "Webinars", desc: "Watch expert sessions and product demos.", tag: "Video" },
    { cat: "cases", icon: BarChart3, color: "#00ff88", title: "Case Studies", desc: "See how businesses are scaling AI sales pipelines.", tag: "Case Study" },
    { cat: "guides", icon: HelpCircle, color: "#8b5cf6", title: "Help Center", desc: "Find answers to common questions and support.", tag: "Support" },
  ]

  const filtered = activeTab === "all" ? resources : resources.filter((r) => r.cat === activeTab)

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
            <button className="transition-colors duration-300" style={{ color: t.accent }}>Resources</button>
            <button onClick={() => onNavigate("contact")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Contact Sales</button>
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
            <span className="text-sm" style={{ color: t.accent }}>Learn, Integrate, and Grow</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl" style={{ color: t.text }}>
            Resources to help you<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${t.accent}, ${t.accentDark})` }}>succeed with VartaSync</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg" style={{ color: t.textMuted }}>
            Explore guides, documentation, and tools to get the most out of our AI voice intelligence platform.
          </p>
        </div>

        <div className="mx-auto mb-8 max-w-xl">
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-300" style={{ borderColor: t.border, backgroundColor: t.inputBg }}>
            <Search className="h-5 w-5" style={{ color: t.textMuted }} />
            <input type="text" placeholder="Search resources..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: t.text }} />
          </div>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300"
                style={
                  activeTab === tab.id
                    ? { backgroundColor: t.accent, color: "#0a0a0f" }
                    : { backgroundColor: "transparent", color: t.textMuted, border: `1px solid ${t.border}` }
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => {
            const Icon = r.icon
            return (
              <div
                key={i}
                className="group flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  borderColor: t.border,
                  backgroundColor: t.bgCard,
                  boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${r.color}15` }}>
                    <Icon className="h-6 w-6" style={{ color: r.color }} />
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: t.accentBg, color: t.accent }}>{r.tag}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ color: t.text }}>{r.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed" style={{ color: t.textMuted }}>{r.desc}</p>
                <div className="flex items-center gap-2 text-sm font-medium transition-colors duration-300" style={{ color: t.accent }}>
                  Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 rounded-2xl border p-8 text-center transition-colors duration-300 md:p-12" style={{ borderColor: t.border, backgroundColor: t.bgCard, boxShadow: dark ? "0 0 60px rgba(0,255,136,0.06)" : "0 10px 40px rgba(0,0,0,0.04)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: t.text }}>Still need help?</h2>
          <p className="mb-6" style={{ color: t.textMuted }}>Our support team is here to help you succeed.</p>
          <button onClick={() => onNavigate("contact")} className="inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-[1.02]" style={{ backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }}>
            Contact Support <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
