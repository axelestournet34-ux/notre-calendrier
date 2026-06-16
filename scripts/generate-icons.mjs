// Génère les icônes carrées de l'app à partir de couple.jpg
// Usage : node scripts/generate-icons.mjs
import sharp from 'sharp'

const SRC = 'couple.jpg'
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
      .resize(size, size, { fit: 'cover', position: sharp.strategy.attention })
      .png()
      .toFile(out)
  )
)

console.log('Icônes générées :', jobs.map(([o]) => o).join(', '))
