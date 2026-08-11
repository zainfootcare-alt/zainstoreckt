import React from 'react';

interface ZainLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const ZainLogo: React.FC<ZainLogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Circular Logo Badge */}
      <div className={`${dimensions} rounded-full bg-black flex items-center justify-center p-1 border-2 border-orange-500 shadow-md flex-shrink-0 relative overflow-hidden group`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer Ring & Crescent */}
          <circle cx="50" cy="50" r="46" fill="black" stroke="#ff6600" strokeWidth="3" />
          <path d="M 15 50 A 35 35 0 1 1 85 50 A 32 32 0 1 0 15 50 Z" fill="#ff6600" opacity="0.9" />

          {/* Stylized Orange Shoe 'Z' */}
          <path
            d="M 22 28 C 30 25, 45 28, 48 35 C 40 45, 30 52, 22 62 C 32 62, 45 60, 48 68 C 35 70, 20 68, 20 62 C 28 50, 38 42, 42 34 Z"
            fill="#ff6600"
          />

          {/* Sharp White 'F' */}
          <path
            d="M 50 25 L 82 25 L 82 33 L 60 33 L 60 45 L 78 45 L 78 53 L 60 53 L 56 75 L 48 75 Z"
            fill="#ffffff"
          />

          {/* ZAIN Text */}
          <text x="50" y="82" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
            ZAIN
          </text>
          
          {/* Footwear Subtext */}
          <text x="50" y="93" textAnchor="middle" fill="#ff6600" fontSize="9" fontWeight="bold" fontFamily="serif" fontStyle="italic">
            Footwear
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-black text-slate-900 tracking-tight text-base uppercase">
            ZAIN <span className="text-[#ff6600]">FOOTWEAR</span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Premium Footwear POS & CRM
          </span>
        </div>
      )}
    </div>
  );
};
