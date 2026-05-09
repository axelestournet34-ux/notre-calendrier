import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panneau décoratif */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-rose-200/20 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
              ♡
            </div>
            <span className="text-xl font-semibold text-text">Notre Calendrier</span>
          </div>
        </div>

        {/* Citation centrale */}
        <div className="relative z-10 text-center">
          <p className="text-4xl font-light text-text-soft leading-relaxed italic">
            &ldquo;Les plus beaux souvenirs<br />sont ceux qu&rsquo;on crée ensemble.&rdquo;
          </p>
        </div>

        {/* Bas */}
        <div className="relative z-10">
          <p className="text-sm text-text-muted text-center">
            Votre espace privé, rien qu&rsquo;à vous deux.
          </p>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-bg">
        {/* Logo mobile uniquement */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-base">
            ♡
          </div>
          <span className="text-base font-semibold text-text">Notre Calendrier</span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
