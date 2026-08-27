import React, { useState } from 'react';

interface ZainLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  lightText?: boolean;
}

export const ZainLogo: React.FC<ZainLogoProps> = ({ size = 'md', className = '', showText = true, lightText = false }) => {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size] || 'w-10 h-10';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Circular Logo Badge */}
      <div className={`${dimensions} rounded-full bg-black flex items-center justify-center p-0.5 border-2 border-orange-500 shadow-md flex-shrink-0 relative overflow-hidden group`}>
        {!imgError ? (
          <img
            src="/pwa-512x512.png"
            alt="Zain Footwear Logo"
            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src="/logo.png"
            alt="Zain Footwear Logo"
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-sm sm:text-base uppercase ${lightText ? 'text-white' : 'text-slate-900'}`}>
            ZAIN <span className="text-orange-500">FOOTWEAR</span>
          </span>
          <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mt-0.5 ${lightText ? 'text-slate-400' : 'text-slate-500'}`}>
            POS & CRM System
          </span>
        </div>
      )}
    </div>
  );
};


