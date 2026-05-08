"use client"

import { X, LogIn, UserPlus } from "lucide-react"
import { Users } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLogin: () => void
  onSelectSignUp: () => void
  dark?: boolean
}

export function AuthModal({ isOpen, onClose, onSelectLogin, onSelectSignUp, dark = false }: AuthModalProps) {
  if (!isOpen) return null

  const t = {
    bg: dark ? "rgba(10,10,15,0.95)" : "rgba(255,255,255,0.98)",
    bgCard: dark ? "rgba(18,18,26,0.9)" : "rgba(255,255,255,1)",
    border: dark ? "#2a2a3a" : "#e0e8e4",
    borderHover: dark ? "rgba(0,255,136,0.4)" : "rgba(0,180,100,0.4)",
    text: dark ? "#e5e5e5" : "#1a2e22",
    textMuted: dark ? "#6b6b7b" : "#5a6b62",
    accent: "#00ff88",
    accentBg: dark ? "rgba(0,255,136,0.1)" : "rgba(0,200,100,0.1)",
    accentGlow: dark ? "0 0 30px rgba(0,255,136,0.4)" : "0 0 20px rgba(0,200,100,0.25)",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      

      <div 
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl border p-8 animate-in zoom-in-95 fade-in duration-300"
        style={{ 
          backgroundColor: t.bgCard, 
          borderColor: t.border,
          boxShadow: dark ? "0 25px 50px rgba(0,0,0,0.5)" : "0 25px 50px rgba(0,0,0,0.15)"
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg transition-all duration-200 hover:scale-110"
          style={{ color: t.textMuted }}
        >
          <X className="h-5 w-5" />
        </button>


        <div className="flex justify-center mb-6">
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: t.accentBg, boxShadow: t.accentGlow }}
          >
            <Users className="h-8 w-8" style={{ color: t.accent }} />
          </div>
        </div>


        <h2 
          className="text-2xl font-bold text-center mb-2"
          style={{ color: t.text }}
        >
          Welcome to VartaSync
        </h2>
        <p 
          className="text-center mb-8"
          style={{ color: t.textMuted }}
        >
          Choose how you want to continue
        </p>


        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={onSelectLogin}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              borderColor: t.border, 
              backgroundColor: dark ? "rgba(30,30,40,0.5)" : "rgba(248,250,249,1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = t.borderHover
              e.currentTarget.style.boxShadow = t.accentGlow
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <span className="font-semibold" style={{ color: t.text }}>Log In</span>
            <span className="text-xs text-center" style={{ color: t.textMuted }}>
              Access your existing account
            </span>
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300"
              style={{ backgroundColor: t.accentBg }}
            >
              <LogIn className="h-5 w-5" style={{ color: t.accent }} />
            </div>
          </button>


          <button
            onClick={onSelectSignUp}
            className="group flex flex-col items-center gap-3 p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
            style={{ 
              borderColor: t.border, 
              backgroundColor: dark ? "rgba(30,30,40,0.5)" : "rgba(248,250,249,1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = t.borderHover
              e.currentTarget.style.boxShadow = t.accentGlow
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border
              e.currentTarget.style.boxShadow = "none"
            }}
          >
            <span className="font-semibold" style={{ color: t.text }}>Sign Up</span>
            <span className="text-xs text-center" style={{ color: t.textMuted }}>
              Create a new account to get started
            </span>
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300"
              style={{ backgroundColor: t.accentBg }}
            >
              <UserPlus className="h-5 w-5" style={{ color: t.accent }} />
            </div>
          </button>
        </div>


        <p className="text-xs text-center" style={{ color: t.textMuted }}>
          By continuing, you agree to our{" "}
          <a href="#" className="underline transition-colors" style={{ color: t.accent }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline transition-colors" style={{ color: t.accent }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
