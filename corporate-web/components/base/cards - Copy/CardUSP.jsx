'use client';

import Icon from '../Icon';
import "../styles/cardUSP.sass";

export default function CardUSP({ 
  variant = "default", // Options: default, background, border
  iconURL, // Contoh: "network.svg"
  title, 
  description, 
  className = "" 
}) {
  
  // Menentukan class tambahan berdasarkan varian selain default
  const variantClass = variant !== "default" ? `lnCardUSP__item--${variant}` : "";

  return (
    <div className={`lnCardUSP__item ${variantClass} ${className}`}>
      {iconURL && (
        <div className="lnCardUSP__icon">
          {typeof iconURL === 'string' && iconURL.startsWith('/') ? (
            <img 
              src={iconURL} 
              alt={title} 
              loading="lazy" 
            />
          ) : (
            <Icon name={iconURL} style={{ '--icon-size': '40px' }} />
          )}
        </div>
      )}
      <div className="lnCardUSP__content">
        <h4 className="lnCardUSP__title text-body-b3 font-bold text-black">
          {title}
        </h4>
        <p className="lnCardUSP__desc text-body-b4 font-regular text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
