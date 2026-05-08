"use client"

import { useState } from "react"
import { Users, Eye, EyeOff, ArrowLeft } from "lucide-react"

interface LoginPageProps {
  onLogin: () => void
  onBack: () => void
  onSwitchToSignUp: () => void
}

export function LoginPage({ onLogin, onBack, onSwitchToSignUp }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: "#0a0f0d" }}>
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full blur-3xl" style={{ backgroundColor: "rgba(0,255,136,0.08)" }} />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full blur-3xl" style={{ backgroundColor: "rgba(0,255,136,0.05)" }} />
        

        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center gap-2 text-sm transition-colors duration-200 hover:opacity-80"
            style={{ color: "#6b6b7b" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h2 className="text-4xl font-bold text-white mb-4">Welcome back!</h2>
          <p className="text-lg mb-12" style={{ color: "#6b6b7b" }}>
            Log in to continue monitoring and optimizing your voice conversations.
          </p>


          <div className="relative">
            <div className="rounded-2xl border p-6 backdrop-blur-xl" style={{ borderColor: "#2a2a3a", backgroundColor: "rgba(18,18,26,0.8)" }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#6b6b7b" }}>Performance Overview</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#00ff88" }} />
                    <span className="text-xs" style={{ color: "#00ff88" }}>Live</span>
                  </div>
                </div>
                

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(0,255,136,0.1)" }}>
                    <div className="text-2xl font-bold" style={{ color: "#00ff88" }}>87%</div>
                    <div className="text-xs" style={{ color: "#6b6b7b" }}>Conversion</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(0,255,136,0.1)" }}>
                    <div className="text-2xl font-bold" style={{ color: "#00ff88" }}>2.4k</div>
                    <div className="text-xs" style={{ color: "#6b6b7b" }}>Calls Today</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(0,255,136,0.1)" }}>
                    <div className="text-2xl font-bold" style={{ color: "#00ff88" }}>98%</div>
                    <div className="text-xs" style={{ color: "#6b6b7b" }}>Accuracy</div>
                  </div>
                </div>


                <div className="flex items-end gap-2 h-24 pt-4">
                  {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 90, 65].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${height}%`, 
                        backgroundColor: i === 10 ? "#00ff88" : "rgba(0,255,136,0.3)",
                        boxShadow: i === 10 ? "0 0 20px rgba(0,255,136,0.5)" : "none"
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12" style={{ backgroundColor: "#ffffff" }}>
        <div className="w-full max-w-md">
          <button 
            onClick={onBack}
            className="lg:hidden flex items-center gap-2 text-sm mb-8 transition-colors duration-200 hover:opacity-80"
            style={{ color: "#5a6b62" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>


          <div className="flex items-center gap-3 mb-8">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#00ff88", boxShadow: "0 0 20px rgba(0,200,100,0.25)" }}
            >
              <Users className="h-5 w-5" style={{ color: "#0a0a0f" }} />
            </div>
            <span className="text-xl font-bold" style={{ color: "#1a2e22" }}>VartaSync</span>
          </div>


          <h1 className="text-3xl font-bold mb-2" style={{ color: "#1a2e22" }}>Log In</h1>
          <p className="mb-8" style={{ color: "#5a6b62" }}>Enter your credentials to access your account</p>


          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a2e22" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none"
                style={{ 
                  borderColor: "#e0e8e4", 
                  backgroundColor: "#f8faf9",
                  color: "#1a2e22"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(0,180,100,0.4)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e0e8e4"}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: "#1a2e22" }}>
                  Password
                </label>
                <a href="#" className="text-sm transition-colors" style={{ color: "#00cc6a" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none pr-12"
                  style={{ 
                    borderColor: "#e0e8e4", 
                    backgroundColor: "#f8faf9",
                    color: "#1a2e22"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(0,180,100,0.4)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e0e8e4"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#5a6b62" }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: "#00ff88", 
                color: "#0a0a0f",
                boxShadow: "0 0 20px rgba(0,200,100,0.25)"
              }}
            >
              Log In
            </button>
          </form>


          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#e0e8e4" }} />
            <span className="text-sm" style={{ color: "#5a6b62" }}>or continue with</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#e0e8e4" }} />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <button 
              className="flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
              style={{ borderColor: "#e0e8e4", backgroundColor: "#ffffff" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: "#1a2e22" }}>Google</span>
            </button>
            <button 
              className="flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
              style={{ borderColor: "#e0e8e4", backgroundColor: "#ffffff" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#00A4EF" d="M11.4 24H0V12.6h11.4V24z"/>
                <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
                <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                <path fill="#7FBA00" d="M24 11.4H12.6V0H24v11.4z"/>
              </svg>
              <span className="text-sm font-medium" style={{ color: "#1a2e22" }}>Microsoft</span>
            </button>
          </div>


          <p className="text-center mt-8" style={{ color: "#5a6b62" }}>
            Don&apos;t have an account?{" "}
            <button 
              onClick={onSwitchToSignUp}
              className="font-semibold transition-colors"
              style={{ color: "#00cc6a" }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
