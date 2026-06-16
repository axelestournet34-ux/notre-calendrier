// Génère les icônes carrées de l'app à partir de couple.jpg
// On détoure automatiquement le cœur (rognage du noir autour) puis on le fait
// remplir le carré : le cœur occupe toute la hauteur, le reste (coins) est noir
// — invisible sur le fond noir. Plus d'espace vide en bas.
// Usage : node scripts/generate-icons.mjs
import sharp from 'sharp'

const SRC = 'couple.jpg'
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
      .trim({ background: '#000000', threshold: 15 })
      .resize(size, size, { fit: 'contain', background: NOIR })
      .png()
      .toFile(out)
  )
)

console.log('Icônes régénérées :', jobs.map(([o]) => o).join(', '))
