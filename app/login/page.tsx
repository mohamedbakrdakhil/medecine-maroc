'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [demoEmail, setDemoEmail] = useState('')
  const router = useRouter()

  async function handleGoogle() {
    setLoading('google')
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  async function handleApple() {
    setLoading('apple')
    // Apple provider requires configuration
    // Until configured, show demo fallback
    setShowDemo(true)
    setLoading(null)
  }

  async function handleDemo(e: React.FormEvent) {
    e.preventDefault()
    if (!demoEmail) return
    setLoading('demo')
    const res = await signIn('demo', {
      email: demoEmail,
      name: 'Étudiant',
      redirect: false,
    })
    if (res?.ok) {
      router.push('/dashboard')
    }
    setLoading(null)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0B1120]">
        {/* Moroccan geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="moroccan" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M30 10 L50 30 L30 50 L10 30 Z" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#moroccan)"/>
          </svg>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full opacity-20 blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-600 rounded-full opacity-15 blur-3xl"/>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">MedMaroc</span>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                <span className="text-red-400 text-sm">🇲🇦</span>
                <span className="text-white/80 text-sm font-medium">Plateforme nationale · Maroc</span>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                La médecine marocaine,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300">
                  en 3D animé
                </span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Cours de médecine selon le programme de ta faculté, avec des modèles anatomiques 3D interactifs et des animations scientifiques.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: '🏥', text: '7 facultés de médecine marocaines' },
                { icon: '🫀', text: 'Anatomie 3D interactive (cœur, cerveau, os...)' },
                { icon: '📚', text: 'Programme officiel de PCEM1 à DCEM4' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                    {f.icon}
                  </div>
                  <span className="text-white/70 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-l-2 border-red-500 pl-4">
            <p className="text-white/50 text-sm italic">
              "La santé est un état de complet bien-être physique, mental et social."
            </p>
            <p className="text-white/30 text-xs mt-1">— OMS</p>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-gray-800 font-semibold">MedMaroc</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Bienvenue 👋</h2>
            <p className="text-gray-500 text-sm">
              Connecte-toi pour accéder à tes cours
            </p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continuer avec Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-black rounded-xl px-4 py-3.5 text-white font-medium text-sm hover:bg-gray-900 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'apple' ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"/>
              ) : (
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Continuer avec Apple
            </button>
          </div>

          {/* Demo mode */}
          {showDemo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-amber-800 text-xs font-medium">
                ⚙️ Apple Sign-In non configuré — utilise le mode démo pour tester
              </p>
              <form onSubmit={handleDemo} className="space-y-2">
                <input
                  type="email"
                  placeholder="ton@email.com"
                  value={demoEmail}
                  onChange={e => setDemoEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
                <button
                  type="submit"
                  disabled={loading === 'demo' || !demoEmail}
                  className="w-full py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {loading === 'demo' ? 'Connexion...' : 'Accéder en mode démo'}
                </button>
              </form>
            </div>
          )}

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-200"/>
            <span className="px-3 text-xs text-gray-400">Accès réservé</span>
            <div className="flex-1 border-t border-gray-200"/>
          </div>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Plateforme dédiée aux étudiants en médecine au Maroc.<br/>
            En continuant, tu acceptes nos{' '}
            <span className="text-gray-600 underline cursor-pointer">Conditions d&apos;utilisation</span>.
          </p>

          {/* Moroccan flag accent */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🇲🇦</span>
            <span>Made in Morocco · pour le Maroc</span>
          </div>
        </div>
      </div>
    </div>
  )
}
