import Image from 'next/image';
import Link from 'next/link';
import Icon from '../Icon';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function CardServicesInner({
  badgeIcon,
  badgeLabel,
  title,
  subtitle,
  backgroundImage,
  backgroundAlt = '',
  gradientHex = '#0057C2',
  href,
  actionIcon,
  actionLabel,
  className = '',
  imageClassName = '',
  contentClassName = '',
  children,
}) {
  const Wrapper = href ? Link : 'article';
  const wrapperProps = href ? { href, 'aria-label': actionLabel || title } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'lnCardServices group relative flex h-[440px] md:h-[560px] w-full overflow-hidden rounded-[20px] p-[24px] md:p-[32px] text-white',
        href ? 'cursor-pointer' : '',
        className,
      )}
    >
      <div className="lnCardServices__background absolute inset-0 overflow-hidden rounded-[20px]">
        <Image
          src={backgroundImage}
          alt={backgroundAlt || title}
          fill
          sizes="(max-width: 767px) 100vw, 600px"
          className={cn(
            'lnCardServices__image h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110',
            imageClassName
          )}
        />
      </div>

      <div
        className="lnCardServices__overlay pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 0%, ${gradientHex} 100%)`,
        }}
      />

      <div className="lnCardServices__content relative z-10 flex h-full w-full flex-col justify-end">
        {(badgeIcon || badgeLabel) && (
          <div className="lnCardServices__badge mb-2.5 flex items-center gap-2.5">
            {badgeIcon && (
              <div className="lnCardServices__badgeIcon flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white p-2 shadow-md">
                <Image
                  src={badgeIcon}
                  alt=""
                  aria-hidden="true"
                  width={18}
                  height={18}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            {badgeLabel && (
              <span className="lnCardServices__badgeLabel text-body-b5 font-bold text-white">
                {badgeLabel}
              </span>
            )}
          </div>
        )}

        <div className={cn('lnCardServices__body flex items-end justify-between gap-6', contentClassName)}>
          <div className="lnCardServices__copy max-w-[440px]">
            {title && (
              <h3 className="lnCardServices__title text-headline-h3 text-white">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="lnCardServices__subtitle mt-2.5 text-body-b4 font-regular text-white line-clamp-2">
                {subtitle}
              </p>
            )}

            {children}
          </div>

          {href && (
            <span className="lnCardServices__action flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white text-[#31343B] shadow-md transition-transform duration-300 group-hover:scale-105">
              {actionIcon || <Icon name="arrow-top-right" />}
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default function CardServices(props) {
  return <CardServicesInner {...props} />;
}
