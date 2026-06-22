'use client';

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const baseItemClass =
  "lnCardUSP relative flex w-full flex-col gap-4 transition-all duration-300";

const sharedIconWrapClass =
  "lnCardUSP__iconWrap mb-2 flex h-auto w-auto justify-start";

const sharedIconClass =
  "lnCardUSP__icon h-10 w-10 object-contain";

const sharedTitleClass =
  "lnCardUSP__title text-body-b3 font-bold leading-[1.4] text-black";

const sharedDescClass =
  "lnCardUSP__description max-w-[95%] text-body-b5 font-regular leading-[1.6] text-secondary";

export default function CardUSP({
  variant = "default", // Options: default, background/card, border, accent-stat, accent-text, icon-left
  iconURL, // Contoh: "network.svg"
  title,
  description,
  className = ""
}) {
  const normalizedVariant = variant === "card" ? "background" : variant;

  if (normalizedVariant === "background") {
    return (
      <div
        className={cx(
          baseItemClass,
          "min-h-[200px] md:min-h-[240px] justify-between rounded-[20px] bg-white p-[20px] shadow-lg hover:-translate-y-[5px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]",
          className
        )}
      >
        {iconURL && (
          <div className={sharedIconWrapClass}>
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className={sharedIconClass}
            />
          </div>
        )}

        <div>
          <h4 className={cx(sharedTitleClass, "mb-2")}>
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (normalizedVariant === "border") {
    return (
      <div
        className={cx(
          baseItemClass,
          "border-l-[2px] border-yellow-500 pl-5",
          className
        )}
      >
        {iconURL && (
          <div className={sharedIconWrapClass}>
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className={sharedIconClass}
            />
          </div>
        )}

        <div>
          <h4 className={cx(sharedTitleClass, "mb-2")}>
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (normalizedVariant === "accent-stat") {
    return (
      <div
        className={cx(
          baseItemClass,
          "border-l-[2px] border-yellow-500 pl-5",
          className
        )}
      >
        {iconURL && (
          <div className={sharedIconWrapClass}>
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className={sharedIconClass}
            />
          </div>
        )}

        <div>
          <h4 className="lnCardUSP__title lnCardUSP__title--stat text-headline-h4 font-bold leading-[1.4] text-black mb-2">
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (normalizedVariant === "accent-text") {
    return (
      <div
        className={cx(
          baseItemClass,
          "border-l-[2px] border-yellow-500 pl-5",
          className
        )}
      >
        {iconURL && (
          <div className={sharedIconWrapClass}>
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className={sharedIconClass}
            />
          </div>
        )}

        <div>
         <h4 className={cx(sharedTitleClass, "mb-2")}>
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (normalizedVariant === "icon-left") {
    return (
      <div
        className={cx(
          "flex w-full items-start gap-4 md:gap-5",
          className
        )}
      >
        {iconURL && (
          <div className="lnCardUSP__iconWrap lnCardUSP__iconWrap--left flex shrink-0 w-auto items-center justify-center">
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className="lnCardUSP__icon lnCardUSP__icon--left h-full w-full object-contain h-8 w-8 md:h-10 md:w-10"
            />
          </div>
        )}

        <div className="lnCardUSP__content flex min-w-0 flex-1 flex-col">
          <h4 className={cx(sharedTitleClass, "mb-2")}>
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (normalizedVariant === "plain") {
    return (
      <div
        className={cx(
          baseItemClass,
          "max-[560px]:flex-row max-[560px]:items-start",
          className
        )}
      >
        {iconURL && (
          <div className={cx(sharedIconWrapClass)}>
            <img
              src={iconURL}
              alt={title}
              loading="lazy"
              className={cx(sharedIconClass, "max-[560px]:h-8 max-[560px]:w-8")}
            />
          </div>
        )}

        <div className="lnCardUSP__content">
          <h4 className={cx(sharedTitleClass, "mb-2")}>
            {title}
          </h4>

          {description && (
            <p className={sharedDescClass}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        baseItemClass,
        "max-[560px]:flex-row max-[560px]:items-start",
        className
      )}
    >
      {iconURL && (
        <div className={cx(sharedIconWrapClass, "max-[560px]:mb-0 max-[560px]:h-8 max-[560px]:w-8")}>
          <img
            src={iconURL}
            alt={title}
            loading="lazy"
            className={cx(sharedIconClass, "max-[560px]:h-8 max-[560px]:w-8")}
          />
        </div>
      )}

      <div className="lnCardUSP__content">
        <h4 className={cx(sharedTitleClass, "mb-2")}>
          {title}
        </h4>

        {description && (
          <p className={sharedDescClass}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
