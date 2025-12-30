'use client'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-2xl' },
    lg: { icon: 64, text: 'text-3xl' },
    xl: { icon: 80, text: 'text-4xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer ring with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
        </defs>

        {/* Soft outer circle */}
        <circle cx="40" cy="40" r="38" fill="url(#ringGradient)" />

        {/* Inner decorative ring */}
        <circle cx="40" cy="40" r="34" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" opacity="0.3" />

        {/* Wedding rings interlinked - elegant and modern */}
        <g transform="translate(40, 38)">
          {/* Left ring */}
          <ellipse cx="-8" cy="0" rx="14" ry="14" fill="none" stroke="url(#logoGradient)" strokeWidth="3.5" />
          {/* Right ring */}
          <ellipse cx="8" cy="0" rx="14" ry="14" fill="none" stroke="url(#logoGradient)" strokeWidth="3.5" />
          {/* Small heart at intersection top */}
          <path
            d="M0,-6 C-1,-7.5 -3,-7.5 -4,-6 C-5,-4.5 -5,-2.5 0,2 C5,-2.5 5,-4.5 4,-6 C3,-7.5 1,-7.5 0,-6"
            fill="url(#logoGradient)"
          />
        </g>

        {/* Small decorative dots */}
        <circle cx="40" cy="12" r="2" fill="url(#logoGradient)" opacity="0.6" />
        <circle cx="40" cy="68" r="2" fill="url(#logoGradient)" opacity="0.6" />
        <circle cx="12" cy="40" r="2" fill="url(#logoGradient)" opacity="0.6" />
        <circle cx="68" cy="40" r="2" fill="url(#logoGradient)" opacity="0.6" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-bold tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent ${text}`}>
            Wedding
          </span>
          <span className={`font-serif font-light tracking-widest text-gray-600 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'} -mt-1`}>
            PREPPED
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ringGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#f3e8ff" />
        </linearGradient>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#ringGradientIcon)" />
      <circle cx="40" cy="40" r="34" fill="none" stroke="url(#logoGradientIcon)" strokeWidth="1.5" opacity="0.3" />

      <g transform="translate(40, 38)">
        <ellipse cx="-8" cy="0" rx="14" ry="14" fill="none" stroke="url(#logoGradientIcon)" strokeWidth="3.5" />
        <ellipse cx="8" cy="0" rx="14" ry="14" fill="none" stroke="url(#logoGradientIcon)" strokeWidth="3.5" />
        <path
          d="M0,-6 C-1,-7.5 -3,-7.5 -4,-6 C-5,-4.5 -5,-2.5 0,2 C5,-2.5 5,-4.5 4,-6 C3,-7.5 1,-7.5 0,-6"
          fill="url(#logoGradientIcon)"
        />
      </g>

      <circle cx="40" cy="12" r="2" fill="url(#logoGradientIcon)" opacity="0.6" />
      <circle cx="40" cy="68" r="2" fill="url(#logoGradientIcon)" opacity="0.6" />
      <circle cx="12" cy="40" r="2" fill="url(#logoGradientIcon)" opacity="0.6" />
      <circle cx="68" cy="40" r="2" fill="url(#logoGradientIcon)" opacity="0.6" />
    </svg>
  )
}
