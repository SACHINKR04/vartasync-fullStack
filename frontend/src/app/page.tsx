"use client"

import { useState } from "react"
import { LandingPage } from "@/components/landing-page"
import { VartaSyncDashboard } from "@/components/vartasync-dashboard"
import { PricingPage } from "@/components/pricing-page"
import { ResourcesPage } from "@/components/resources-page"
import { ContactPage } from "@/components/contact-page"

type View = "landing" | "dashboard" | "pricing" | "resources" | "contact"

export default function Page() {
  const [view, setView] = useState<View>("landing")

  const handleGoToDashboard = () => setView("dashboard")
  const handleBackToLanding = () => setView("landing")
  const handleNavigate = (page: string) => setView(page as View)

  if (view === "dashboard") return <VartaSyncDashboard onLogout={handleBackToLanding} onGoHome={handleBackToLanding} />
  if (view === "pricing") return <PricingPage onBack={handleBackToLanding} onLogin={handleGoToDashboard} onNavigate={handleNavigate} />
  if (view === "resources") return <ResourcesPage onBack={handleBackToLanding} onLogin={handleGoToDashboard} onNavigate={handleNavigate} />
  if (view === "contact") return <ContactPage onBack={handleBackToLanding} onLogin={handleGoToDashboard} onNavigate={handleNavigate} />

  return <LandingPage onLogin={handleGoToDashboard} onNavigate={handleNavigate} />
}
