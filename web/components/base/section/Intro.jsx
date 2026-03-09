'use client';

export default function SectionIntro({ 
  label, 
  title, 
  description, 
  as: Tag = "h2", // Menentukan tag heading (default h2)
  align = "left", // left, center, right
  className = "" 
}) {
  
  // Mapping class berdasarkan alignment
  const alignClasses = {
    left: "text-left items-start lg:w-[80%]",
    center: "lnIntro--center text-center items-center mx-auto lg:w-[80%]",
    right: "text-right items-end ml-auto"
  };

  const isCenter = align === "center";

  return (
    <div 
      className={`lnIntro flex flex-col 
      ${isCenter ? 'gap-6' : 'md:flex-row md:justify-between md:items-end gap-6'} 
      ${alignClasses[align]} ${className}`}
      style={isCenter ? { textAlign: '-webkit-center' } : {}}
    >
      <div className={`lnIntro__content flex flex-col ${isCenter ? 'w-full' : 'max-w-[800px]'} ${alignClasses[align]}`}>
        {label && (
          <div className="lnIntro__label text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
            {label}
          </div>
        )}

        {/* Dynamic Heading Tag */}
        <Tag className="lnIntro__title text-headline-h3 font-bold text-black mt-3 leading-tight">
          {title}
        </Tag>

        {description && (
          <p className={`lnIntro__desc text-body-b4 mt-4 font-regular text-secondary leading-relaxed ${isCenter ? 'mx-auto md:w-[80%]' : 'md:w-[80%]'}`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

{/* 
  // Cara Pemakaian
  <SectionIntro 
    as="h2"
    label="LIFE AT LINKNET"
    title="Ready to join us as First Squad?"
    description="We collaborate to achieve common goals and have a positive impact on the company."
    align="center"
  /> 
*/}