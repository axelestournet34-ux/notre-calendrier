'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/utils/cn'
import type { Notification } from '@/types/app.types'

export function NotificationBell() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const conteneurRef = useRef<HTMLDivElement>(null)
  const userIdRef = useRef<string | null>(null)

  // ─── Chargement initial + temps réel ───
  useEffect(() => {
    let actif = true

    async function charger() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !actif) return
      userIdRef.current = user.id

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30)

      if (!actif) return
      const liste = data ?? []
      setNotifs(liste)
      setUnread(liste.filter((n) => !n.read_at).length)
    }

    charger()

    // Réception en direct des nouvelles notifications
    let channel: ReturnType<typeof supabase.channel> | null = null
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !actif) return
      supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`notifs-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${session.user.id}`,
          },
          (payload) => {
            const n = payload.new as Notification
            setNotifs((prev) => [n, ...prev].slice(0, 30))
            setUnread((c) => c + 1)
            toast(n.title, {
              description: n.body ?? undefined,
              action: n.link
                ? { label: 'Voir', onClick: () => router.push(n.link as string) }
                : undefined,
            })
          }
        )
        .subscribe()
    })()

    // Rafraîchir quand l'onglet redevient actif
    function onVisible() {
      if (document.visibilityState === 'visible') charger()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      actif = false
      document.removeEventListener('visibilitychange', onVisible)
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, router])

  // ─── Fermer au clic extérieur ───
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function basculer() {
    const prochain = !open
    setOpen(prochain)

    // À l'ouverture, on marque tout comme lu
    if (prochain && unread > 0) {
      const maintenant = new Date().toISOString()
      setUnread(0)
      setNotifs((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: maintenant })))
      const userId = userIdRef.current
      if (userId) {
        await supabase
          .from('notifications')
          .update({ read_at: maintenant })
          .eq('recipient_id', userId)
          .is('read_at', null)
      }
    }
  }

  return (
    <div ref={conteneurRef} className="relative">
      <button
        onClick={basculer}
        aria-label="Notifications"
        className={cn(
          'relative p-1.5 rounded-lg border border-border bg-surface',
          'text-text-muted hover:text-text transition-colors'
        )}
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-50',
            'rounded-2xl border border-border bg-surface shadow-xl overflow-hidden'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text">Notifications</p>
            {notifs.length > 0 && (
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <CheckCheck size={12} /> À jour
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="size-12 rounded-full bg-primary-light flex items-center justify-center text-xl mx-auto mb-3">
                  🔔
                </div>
                <p className="text-sm text-text-muted">Aucune notification pour l&apos;instant.</p>
              </div>
            ) : (
              notifs.map((n) => {
                const contenu = (
                  <>
                    <div className="flex items-start gap-2">
                      {!n.read_at && <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm text-text leading-snug">{n.title}</p>
                        {n.body && <p className="text-xs text-text-soft mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[11px] text-text-muted mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                  </>
                )
                const classes = 'block px-4 py-3 border-b border-border last:border-0 hover:bg-surface-raised transition-colors'
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className={classes}>
                    {contenu}
                  </Link>
                ) : (
                  <div key={n.id} className={classes}>
                    {contenu}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
