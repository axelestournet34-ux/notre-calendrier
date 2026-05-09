'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

interface Lieu {
  nom: string
  count: number
}

interface LieuGeocode extends Lieu {
  lat: number
  lng: number
}

interface Props {
  lieux: Lieu[]
}

export function CarteLieux({ lieux }: Props) {
  const [lieuxGeocodesState, setLieuxGeocode] = useState<LieuGeocode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (lieux.length === 0) { setLoading(false); return }

    async function geocoder() {
      const resultats: LieuGeocode[] = []
      for (const lieu of lieux) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(lieu.nom)}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'fr' } }
          )
          const data = await res.json()
          if (data[0]) {
            resultats.push({ ...lieu, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
          }
        } catch {
          // lieu introuvable, on ignore
        }
        // petite pause pour respecter Nominatim (max 1 req/sec)
        await new Promise((r) => setTimeout(r, 300))
      }
      setLieuxGeocode(resultats)
      setLoading(false)
    }

    geocoder()
  }, [lieux])

  const centre: [number, number] = lieuxGeocodesState.length > 0
    ? [
        lieuxGeocodesState.reduce((s, l) => s + l.lat, 0) / lieuxGeocodesState.length,
        lieuxGeocodesState.reduce((s, l) => s + l.lng, 0) / lieuxGeocodesState.length,
      ]
    : [46.8, 2.3]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-surface-raised border border-border">
        <p className="text-sm text-text-muted animate-pulse">Chargement de la carte…</p>
      </div>
    )
  }

  if (lieuxGeocodesState.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 rounded-2xl bg-surface-raised border border-border">
        <p className="text-sm text-text-muted">Aucun lieu à afficher sur la carte.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ height: 360 }}>
      <MapContainer center={centre} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {lieuxGeocodesState.map((lieu) => (
          <CircleMarker
            key={lieu.nom}
            center={[lieu.lat, lieu.lng]}
            radius={8 + lieu.count * 2}
            pathOptions={{ color: '#c47c82', fillColor: '#c47c82', fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm font-medium">{lieu.nom}</div>
              <div className="text-xs text-gray-500">
                {lieu.count} souvenir{lieu.count > 1 ? 's' : ''}
              </div>
              <Link
                href={`/lieux`}
                className="text-xs text-rose-500 hover:underline"
              >
                Voir →
              </Link>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
