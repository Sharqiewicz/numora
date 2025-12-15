import github from '@/assets/github.svg'
import x from '@/assets/x.svg'
import { cn } from '@/lib/utils'

export function Socials({className}: {className: string}) {
  return (
    <div className={cn(className, 'flex gap-6')}>
      <a href="https://x.com/sharqiewicz" target="_blank" rel="noopener noreferrer">
        <img src={x} alt="X" className="w-6 h-6 hover:scale-105 transition-transform duration-300 cursor-pointer" />
      </a>
      <a href="https://github.com/sharqiewicz/numora" target="_blank" rel="noopener noreferrer">
        <img src={github} alt="GitHub" className="w-6 h-6 hover:scale-105 transition-transform duration-300 cursor-pointer" />
      </a>
    </div>
  )
}