'use client'

interface Props {
  label?: string
  className?: string
}

export function BoutonImprimer({ label = 'Imprimer / PDF', className }: Props) {
  return (
    <button
      onClick={() => window.print()}
      className={className}
    >
      {label}
    </button>
  )
}
