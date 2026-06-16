// Génère les icônes carrées de l'app à partir de couple.jpg
// Le cœur est plus haut que large : on le centre dans le carré et on
// complète avec du noir (fond déjà noir → invisible). Tout le cœur reste
// visible (icône + splash de démarrage).
// Usage : node scripts/generate-icons.mjs
import sharp from 'sharp'

const SRC = 'couple.jpg'
// Région contenant tout le cœur (centrée verticalement sur le cœur)
const CROP = { left: 0, top: 390, width: 1080, height: 1440 }
const NOIR = { r: 0, g: 0, b: 0, alpha: 1 }

const jobs = [
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
  ['public/apple-icon.png', 180],
  ['app/icon.png', 512],
  ['app/apple-icon.png', 180],
]

await Promise.all(
  jobs.map(([out, size]) =>
    sharp(SRC)
      .extract(CROP)
      .resize(size, size, { fit: 'contain', background: NOIR })
      .png()
      .toFile(out)
  )
)

console.log('Icônes régénérées :', jobs.map(([o]) => o).join(', '))
