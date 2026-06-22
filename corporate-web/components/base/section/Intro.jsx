'use client';

import { hasIntroContent, resolveIntroTextValue } from '@/shared/presentation/intro';

const ALLOWED_HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']);

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
  const hasContent = hasIntroContent({
    label: safeLabel,
    title: safeTitle,
    description: safeDescription,
  });

  if (!hasContent) return null;

  const SafeTag = ALLOWED_HEADING_TAGS.has(Tag) ? Tag : 'h2';
  
  // Mapping class berdasarkan alignment
  const alignClasses = {
    left: `text-left items-start ${fluid ? '' : 'lg:w-[80%]'}`.trim(),
    center: `lnIntro--center text-center items-center mx-auto ${fluid ? '' : 'lg:w-[80%]'}`.trim(),
    right: "text-right items-end ml-auto"
  };

  const safeAlign = alignClasses[align] ? align : 'left';
  const isCenter = safeAlign === "center";

  return (
    <div 
      className={`lnIntro flex flex-col 
      ${isCenter ? 'gap-6' : 'md:flex-row md:justify-between md:items-end gap-6'} 
      ${alignClasses[safeAlign]} ${className}`}
      style={isCenter ? { textAlign: '-webkit-center' } : {}}
    >
      <div className={`lnIntro__content flex flex-col ${isCenter ? 'w-full' : (fluid ? '' : 'max-w-[800px]')} ${alignClasses[safeAlign]}`}>
        {safeLabel && (
          <div className={`lnIntro__label text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none ${labelClassName}`}>
            {safeLabel}
          </div>
        )}

        {/* Dynamic Heading Tag */}
        {safeTitle && (
          <SafeTag className={`lnIntro__title text-headline-h3 md:text-headline-h3 font-bold text-black ${safeLabel ? 'mt-3' : ''} leading-tight ${titleClassName}`}>
            {safeTitle}
          </SafeTag>
        )}

        {safeDescription && (
          <p className={`lnIntro__desc text-body-b4 ${safeLabel || safeTitle ? 'mt-4' : ''} font-regular text-secondary leading-relaxed ${isCenter ? 'mx-auto md:w-[80%]' : 'md:w-[80%]'} ${descriptionClassName}`}>
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
