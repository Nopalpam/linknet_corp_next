export default function Button({ 
  children, 
  variant = 'primary', // primary, secondary, warning, info, danger, link
  outline = false,
  plain = false,
  size = 'md',         // sm, md, lg
  className = '',
  disabled = false,
  iconLeft,
  iconRight,
  ...props 
}) {
  
  // Logic untuk menentukan class berdasarkan props
  const getVariantClass = () => {
    if (variant === 'link') return 'btn-link';
    if (disabled) return outline ? 'btn-disabled-outline' : 'btn-disabled';
    
    let baseClass = `btn-${variant}`;
    if (outline) baseClass += '-outline';
    else if (plain) baseClass += '-plain';
    
    return baseClass;
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'btn-sm';
    if (size === 'lg') return 'btn-lg';
    return ''; // default md
  };

  return (
    <button
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {iconLeft && <span style={{ display: 'flex' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'flex' }}>{iconRight}</span>}
    </button>
  );
}

// HOW TO USE

// import Button from '../components/base/Button';
// import { FiArrowRight } from 'react-icons/fi'; // Contoh jika pakai react-icons

// export default function HeroSection() {
//   return (
//     <div className="flex gap-4">
//       <Button size="lg" iconRight={<FiArrowRight />}>
//         Mulai Langganan
//       </Button>
      
//       <Button variant="secondary" outline>
//         Pelajari Fitur
//       </Button>
//     </div>
//   );
// }