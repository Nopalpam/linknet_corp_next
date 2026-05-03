'use client';

import { resolveIntroTextValue } from '../../../../shared/presentation/intro';

export default function SectionIntro({ 
  label, 
  title, 
  description, 
  as: Tag = "h2", // Menentukan tag heading (default h2)
  align = "left", // left, center, right
  fluid = false,
  labelClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  className = "" 
}) {
  const safeLabel = resolveIntroTextValue(label);
  const safeTitle = resolveIntroTextValue(title);
  const safeDescription = resolveIntroTextValue(description);
  
  // Mapping class berdasarkan alignment
  const alignClasses = {
    left: `text-left items-start ${fluid ? '' : 'lg:w-[80%]'}`.trim(),
    center: `lnIntro--center text-center items-center mx-auto ${fluid ? '' : 'lg:w-[80%]'}`.trim(),
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
      <div className={`lnIntro__content flex flex-col ${isCenter ? 'w-full' : (fluid ? '' : 'max-w-[800px]')} ${alignClasses[align]}`}>
        {safeLabel && (
          <div className={`lnIntro__label text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none ${labelClassName}`}>
            {safeLabel}
          </div>
        )}

        {/* Dynamic Heading Tag */}
        <Tag className={`lnIntro__title text-headline-h3 md:text-headline-h3 font-bold text-black mt-3 leading-tight ${titleClassName}`}>
          {safeTitle}
        </Tag>

        {safeDescription && (
          <p className={`lnIntro__desc text-body-b4 mt-4 font-regular text-secondary leading-relaxed ${isCenter ? 'mx-auto md:w-[80%]' : 'md:w-[80%]'} ${descriptionClassName}`}>
            {safeDescription}
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
