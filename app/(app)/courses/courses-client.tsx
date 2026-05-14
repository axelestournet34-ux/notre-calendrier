'use client'

import { useEffect, useOptimistic, useState, useTransition } from 'react'
import { ShoppingCart, Plus, Trash2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { ajouterArticle, toggleArticle, supprimerArticle } from '@/features/courses/actions'

type Article = { id: string; content: string; done: boolean; created_at: string }

interface CoursesClientProps {
  coupleId: string
  articlesInitiaux: Article[]
}

export function CoursesClient({ coupleId, articlesInitiaux }: CoursesClientProps) {
  const [articles, setArticles] = useState<Article[]>(articlesInitiaux)
  const [nouvelArticle, setNouvelArticle] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('liste_courses_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'liste_courses', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nouveau = payload.new as Article
            setArticles((prev) => {
              if (prev.some((a) => a.id === nouveau.id)) return prev
              return [...prev, nouveau]
            })
          } else if (payload.eventType === 'UPDATE') {
            const mis = payload.new as Article
            setArticles((prev) => prev.map((a) => (a.id === mis.id ? mis : a)))
          } else if (payload.eventType === 'DELETE') {
            const supp = payload.old as { id: string }
            setArticles((prev) => prev.filter((a) => a.id !== supp.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [coupleId])

  async function handleAjouter(e: React.FormEvent) {
    e.preventDefault()
    if (!nouvelArticle.trim()) return
    setErreur(null)
    const res = await ajouterArticle(coupleId, nouvelArticle)
    if (res?.error) {
      setErreur(res.error)
    } else {
      setNouvelArticle('')
    }
  }

  function handleToggle(id: string, done: boolean) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, done } : a)))
    startTransition(async () => {
      await toggleArticle(id, done)
    })
  }

  function handleSupprimer(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
    startTransition(async () => {
      await supprimerArticle(id)
    })
  }

  const restants = articles.filter((a) => !a.done)
  const faits = articles.filter((a) => a.done)

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary-light via-rose-50 to-accent-light dark:from-primary-light dark:via-rose-950/20 dark:to-accent-light border-none">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
            <ShoppingCart size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Liste de courses</p>
            <p className="text-xs text-text-muted">
              {restants.length} article{restants.length !== 1 ? 's' : ''} restant{restants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleAjouter} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Ajouter un article..."
              value={nouvelArticle}
              onChange={(e) => setNouvelArticle(e.target.value)}
              maxLength={200}
              iconLeft={<Plus size={16} />}
            />
          </div>
          <Button type="submit" disabled={!nouvelArticle.trim()}>
            Ajouter
          </Button>
        </form>
        {erreur && <p className="text-xs text-red-500 mt-2">{erreur}</p>}
      </Card>

      {articles.length === 0 && (
        <div className="text-center py-10 space-y-2">
          <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">
            🛒
          </div>
          <p className="text-sm text-text-muted">Votre liste est vide.</p>
          <p className="text-xs text-text-muted">Ajoutez votre premier article ci-dessus.</p>
        </div>
      )}

      {restants.length > 0 && (
        <Card className="space-y-1 p-3">
          {restants.map((article) => (
            <ArticleLigne
              key={article.id}
              article={article}
              onToggle={handleToggle}
              onSupprimer={handleSupprimer}
            />
          ))}
        </Card>
      )}

      {faits.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
            Déjà dans le panier ({faits.length})
          </p>
          <Card className="space-y-1 p-3 opacity-70">
            {faits.map((article) => (
              <ArticleLigne
                key={article.id}
                article={article}
                onToggle={handleToggle}
                onSupprimer={handleSupprimer}
              />
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}

function ArticleLigne({
  article,
  onToggle,
  onSupprimer,
}: {
  article: Article
  onToggle: (id: string, done: boolean) => void
  onSupprimer: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-surface-raised transition-colors group">
      <button
        onClick={() => onToggle(article.id, !article.done)}
        className={cn(
          'size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150',
          article.done
            ? 'bg-primary border-primary text-white'
            : 'border-border hover:border-primary'
        )}
        aria-label={article.done ? 'Marquer comme non fait' : 'Marquer comme fait'}
      >
        {article.done && <Check size={12} strokeWidth={3} />}
      </button>
      <span
        className={cn(
          'flex-1 text-sm text-text transition-all duration-150',
          article.done && 'line-through text-text-muted'
        )}
      >
        {article.content}
      </span>
      <button
        onClick={() => onSupprimer(article.id)}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all duration-150 p-1"
        aria-label="Supprimer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
