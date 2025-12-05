'use client';

// =============================================================================
// FRCT Logo Component
// =============================================================================
// Custom minimalist logo representing cross-chain treasury routing
// =============================================================================

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
  xl: { icon: 80, text: 'text-4xl' },
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Simple solid diamond */}
      <div 
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: icon * 0.5, height: icon * 0.5 }}
        >
          {/* Solid black diamond */}
          <path 
            d="M16 2L30 16L16 30L2 16L16 2Z" 
            fill="black"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent ${text}`}>
          FRCT
        </span>
      )}
    </div>
  );
}

// Alternative logo designs (uncomment to try)

// Design 2: Circular flow with F
export function LogoAlt1({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: icon * 0.55, height: icon * 0.55 }}
        >
          {/* Stylized F */}
          <path 
            d="M10 8H22M10 8V24M10 16H18" 
            stroke="black" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent ${text}`}>
          FRCT
        </span>
      )}
    </div>
  );
}

// Design 3: Abstract diamond/crystal (forecast/treasury)
export function LogoAlt2({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: icon * 0.6, height: icon * 0.6 }}
        >
          {/* Diamond shape */}
          <path 
            d="M16 4L28 16L16 28L4 16L16 4Z" 
            stroke="black" 
            strokeWidth="2.5" 
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner horizontal line */}
          <path 
            d="M8 16H24" 
            stroke="black" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          {/* Vertical accent */}
          <path 
            d="M16 10V22" 
            stroke="black" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent ${text}`}>
          FRCT
        </span>
      )}
    </div>
  );
}

// Design 4: Two circles with flow (representing Base <-> Solana)
export function LogoAlt3({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500"
        style={{ width: icon, height: icon }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: icon * 0.65, height: icon * 0.65 }}
        >
          {/* Left circle (Base) */}
          <circle 
            cx="9" 
            cy="16" 
            r="5" 
            stroke="black" 
            strokeWidth="2.5"
            fill="none"
          />
          {/* Right circle (Solana) */}
          <circle 
            cx="23" 
            cy="16" 
            r="5" 
            stroke="black" 
            strokeWidth="2.5"
            fill="none"
          />
          {/* Connecting flow line */}
          <path 
            d="M14 16H18" 
            stroke="black" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent ${text}`}>
          FRCT
        </span>
      )}
    </div>
  );
}

