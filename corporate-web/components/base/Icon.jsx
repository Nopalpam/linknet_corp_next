export default function Icon({ name, colorClass = '', className = '', style = {} }) {
  // name contoh: 'arrow-right', 'mail', dll.
  return (
    <span 
      className={`icon icon__${name} ${colorClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}



// HOW TO USE

// import Button from './base/Button';
// import Icon from './base/Icon';

// export default function ContactButton() {
//   return (
//     <Button 
//       variant="info" 
//       iconLeft={<Icon name="mail" colorClass="icon--white" />}
//     >
//       Hubungi Kami
//     </Button>
//   );
// }