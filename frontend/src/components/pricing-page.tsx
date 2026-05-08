"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Users, Check, Sun, Moon, ArrowRight, Zap, Shield, Headphones, BarChart3, Phone, Globe, ChevronRight } from "lucide-react"

interface Props {
  onBack: () => void
  onLogin: () => void
  onNavigate: (page: string) => void
}

export function PricingPage({ onBack, onLogin, onNavigate }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [yearly, setYearly] = useState(false)

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
  }

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for small teams getting started.",
      price: yearly ? 24999 : 2499,
      period: yearly ? "/year" : "/month",
      popular: false,
      cta: "Get Started",
      features: [
        "1,000 AI Voice Minutes",
        "Basic Analytics",
        "Live Call Monitoring",
        "Email Support",
        "2 Team Members",
      ],
    },
    {
      name: "Growth",
      desc: "Ideal for growing sales teams.",
      price: yearly ? 69999 : 6999,
      period: yearly ? "/year" : "/month",
      popular: true,
      cta: "Get Started",
      features: [
        "5,000 AI Voice Minutes",
        "Advanced Analytics",
        "Pipeline Insights",
        "Priority Support",
        "Team Management",
      ],
    },
    {
      name: "Business",
      desc: "For businesses that need more power.",
      price: yearly ? 169999 : 16999,
      period: yearly ? "/year" : "/month",
      popular: false,
      cta: "Get Started",
      features: [
        "15,000 AI Voice Minutes",
        "Advanced Integrations",
        "Advanced Security",
        "Dedicated Support",
        "Multi-team Access",
      ],
    },
    {
      name: "Enterprise",
      desc: "For large organizations with custom needs.",
      price: null,
      period: "",
      popular: false,
      cta: "Contact Sales",
      features: [
        "Unlimited Voice Minutes",
        "Custom Features",
        "Dedicated Account Manager",
        "SLA & Compliance",
        "On-premise Deployment",
      ],
    },
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
            <button className="transition-colors duration-300" style={{ color: t.accent }}>Pricing</button>
            <button onClick={() => onNavigate("resources")} className="transition-colors duration-300 hover:opacity-80" style={{ color: t.textMuted }}>Resources</button>
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
            <span className="text-sm" style={{ color: t.accent }}>Simple, Transparent Pricing</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl" style={{ color: t.text }}>
            Choose the perfect plan<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${t.accent}, ${t.accentDark})` }}>for your business</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg" style={{ color: t.textMuted }}>
            Start free and scale as you grow. All plans include our core AI voice intelligence features.
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <span className="text-sm font-medium" style={{ color: !yearly ? t.text : t.textMuted }}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300"
            style={{ backgroundColor: yearly ? t.accent : dark ? "#2a2a3a" : "#d0d8d4" }}
          >
            <div className="h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300" style={{ transform: yearly ? "translateX(32px)" : "translateX(0)" }} />
          </button>
          <span className="text-sm font-medium" style={{ color: yearly ? t.text : t.textMuted }}>
            Yearly <span className="text-xs font-semibold" style={{ color: t.accent }}>(Save 27%)</span>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                borderColor: plan.popular ? t.accent : t.border,
                backgroundColor: t.bgCard,
                boxShadow: plan.popular ? (dark ? "0 0 40px rgba(0,255,136,0.15)" : "0 0 30px rgba(0,200,100,0.12)") : dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold" style={{ backgroundColor: t.accent, color: "#0a0a0f" }}>
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold mb-1" style={{ color: t.text }}>{plan.name}</h3>
              <p className="text-sm mb-6" style={{ color: t.textMuted }}>{plan.desc}</p>
              <div className="mb-6">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold" style={{ color: t.text }}>₹{plan.price.toLocaleString("en-IN")}</span>
                    <span className="text-sm" style={{ color: t.textMuted }}>{plan.period}</span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold" style={{ color: t.text }}>Custom</span>
                )}
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: t.textMuted }}>
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: t.accent }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={plan.cta === "Contact Sales" ? () => onNavigate("contact") : onLogin}
                className="w-full rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-[1.02]"
                style={
                  plan.popular
                    ? { backgroundColor: t.accent, color: "#0a0a0f", boxShadow: t.accentGlow }
                    : { backgroundColor: "transparent", color: t.text, border: `1px solid ${t.border}` }
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm" style={{ color: t.textMuted }}>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4" style={{ color: t.accent }} /> No Setup Fees</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: t.accent }} /> Cancel Anytime</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4" style={{ color: t.accent }} /> 14-Day Free Trial</div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4" style={{ color: t.accent }} /> Enterprise Security</div>
        </div>
      </main>
    </div>
  )
}
