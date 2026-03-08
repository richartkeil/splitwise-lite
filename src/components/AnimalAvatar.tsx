import { cn } from '@/lib/utils'

const animals = [
  { folder: 'Bear', file: 'bear_3d.png' },
  { folder: 'Cat', file: 'cat_3d.png' },
  { folder: 'Rabbit face', file: 'rabbit_face_3d.png' },
  { folder: 'Fox', file: 'fox_3d.png' },
  { folder: 'Owl', file: 'owl_3d.png' },
  { folder: 'Penguin', file: 'penguin_3d.png' },
  { folder: 'Frog', file: 'frog_3d.png' },
  { folder: 'Panda', file: 'panda_3d.png' },
  { folder: 'Dog face', file: 'dog_face_3d.png' },
  { folder: 'Hamster', file: 'hamster_3d.png' },
  { folder: 'Koala', file: 'koala_3d.png' },
  { folder: 'Unicorn', file: 'unicorn_3d.png' },
  { folder: 'Dolphin', file: 'dolphin_3d.png' },
  { folder: 'Turtle', file: 'turtle_3d.png' },
  { folder: 'Butterfly', file: 'butterfly_3d.png' },
  { folder: 'Octopus', file: 'octopus_3d.png' },
  { folder: 'Hedgehog', file: 'hedgehog_3d.png' },
  { folder: 'Sloth', file: 'sloth_3d.png' },
  { folder: 'Otter', file: 'otter_3d.png' },
  { folder: 'Raccoon', file: 'raccoon_3d.png' },
  { folder: 'Tiger face', file: 'tiger_face_3d.png' },
  { folder: 'Lion', file: 'lion_3d.png' },
  { folder: 'Monkey face', file: 'monkey_face_3d.png' },
  { folder: 'Elephant', file: 'elephant_3d.png' },
  { folder: 'Giraffe', file: 'giraffe_3d.png' },
  { folder: 'Flamingo', file: 'flamingo_3d.png' },
  { folder: 'Deer', file: 'deer_3d.png' },
  { folder: 'Swan', file: 'swan_3d.png' },
  { folder: 'Parrot', file: 'parrot_3d.png' },
  { folder: 'Llama', file: 'llama_3d.png' },
  { folder: 'Seal', file: 'seal_3d.png' },
  { folder: 'Beaver', file: 'beaver_3d.png' },
  { folder: 'Hatching chick', file: 'hatching_chick_3d.png' },
  { folder: 'Duck', file: 'duck_3d.png' },
  { folder: 'Whale', file: 'whale_3d.png' },
  { folder: 'Kangaroo', file: 'kangaroo_3d.png' },
  { folder: 'Peacock', file: 'peacock_3d.png' },
  { folder: 'Hippopotamus', file: 'hippopotamus_3d.png' },
  { folder: 'Gorilla', file: 'gorilla_3d.png' },
  { folder: 'Zebra', file: 'zebra_3d.png' },
]

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets'

function getAnimalUrl(index: number): string {
  const animal = animals[index % animals.length]
  return `${CDN_BASE}/${encodeURIComponent(animal.folder)}/3D/${animal.file}`
}

export function getAnimalName(index: number): string {
  const animal = animals[index % animals.length]
  return animal.folder
}

type AnimalAvatarProps = {
  index: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14',
}

export function AnimalAvatar({ index, size = 'md', className }: AnimalAvatarProps) {
  const url = getAnimalUrl(index)
  const name = getAnimalName(index)

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-white/60 shadow-sm ring-1 ring-white/80',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={url}
        alt={name}
        className="w-[85%] h-[85%] object-contain drop-shadow-sm"
        loading="lazy"
      />
    </div>
  )
}

export function getMemberIndex(members: { id: string }[], memberId: string): number {
  const idx = members.findIndex((m) => m.id === memberId)
  return idx >= 0 ? idx : 0
}
