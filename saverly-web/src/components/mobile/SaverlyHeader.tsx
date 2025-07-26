import { Link } from 'react-router-dom'

interface SaverlyHeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  className?: string
}

export function SaverlyHeader({ 
  title = "Saverly", 
  subtitle, 
  showLogo = true,
  className = ""
}: SaverlyHeaderProps) {
  return (
    <div className={`bg-gradient-to-r from-primary-500 to-primary-600 text-white ${className}`}>
      <div className="px-4 py-6">
        <div className="text-center">
          {showLogo && (
            <Link to="/">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent cursor-pointer">
                {title}
              </span>
            </Link>
          )}
          {subtitle && (
            <p className="text-white/90 text-lg mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}