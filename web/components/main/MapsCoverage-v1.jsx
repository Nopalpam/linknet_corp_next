'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Intro from '../base/section/Intro';
import LinknetLink from '../base/Link';
import Button from '../base/Button';
import Icon from '../base/Icon';
import { MAPS_COVERAGE_DATA } from '../../data/components/mapsCoverage';
import { MAP_REGIONS_DATA } from '../../data/constants/mapRegions';
import INDO_TOPOLOGY from '../../data/constants/id-all.topo.json';

const MAP_WIDTH = 1150;
const MAP_PADDING = 20;
function projectPoint([lon, lat], bbox, scaleFactor) {
  const [minLon, minLat, maxLon, maxLat] = bbox;

  return [
    (lon - minLon) * scaleFactor + MAP_PADDING,
    (maxLat - lat) * scaleFactor + MAP_PADDING,
  ];
}

function getArcPoints(topology, arcIndex, arcCache) {
  const normalizedIndex = arcIndex >= 0 ? arcIndex : ~arcIndex;

  if (!arcCache.has(normalizedIndex)) {
    const arc = topology.arcs[normalizedIndex];
    const [scaleX, scaleY] = topology.transform.scale;
    const [translateX, translateY] = topology.transform.translate;
    let x = 0;
    let y = 0;

    const decodedPoints = arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [translateX + x * scaleX, translateY + y * scaleY];
    });

    arcCache.set(normalizedIndex, decodedPoints);
  }

  const basePoints = arcCache.get(normalizedIndex);
  return arcIndex >= 0 ? basePoints : [...basePoints].reverse();
}

function buildRing(topology, ringArcs, bbox, scaleFactor, arcCache) {
  const ringPoints = [];

  ringArcs.forEach((arcIndex, index) => {
    const arcPoints = getArcPoints(topology, arcIndex, arcCache);
    const pointsToAppend = index === 0 ? arcPoints : arcPoints.slice(1);
    ringPoints.push(...pointsToAppend);
  });

  return ringPoints.map((point) => projectPoint(point, bbox, scaleFactor));
}

function ringToPath(ring) {
  if (!ring.length) return '';
  return `${ring.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')} Z`;
}

function getBounds(points) {
  return points.reduce(
    (acc, [x, y]) => ({
      minX: Math.min(acc.minX, x),
      minY: Math.min(acc.minY, y),
      maxX: Math.max(acc.maxX, x),
      maxY: Math.max(acc.maxY, y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  );
}

function buildMapFeatures(topology, provinceMap, colors) {
  const bbox = topology.bbox;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const scaleFactor = MAP_WIDTH / (maxLon - minLon);
  const mapHeight = (maxLat - minLat) * scaleFactor + MAP_PADDING * 2;
  const mapWidth = MAP_WIDTH + MAP_PADDING * 2;
  const arcCache = new Map();

  const features = topology.objects.default.geometries
    .filter((geometry) => geometry.properties?.name)
    .map((geometry) => {
      const provinceKey = geometry.properties['hc-key'];
      const isCovered = Boolean(provinceMap[provinceKey]);
      const rings = geometry.type === 'Polygon'
        ? geometry.arcs.map((ringArcs) => buildRing(topology, ringArcs, bbox, scaleFactor, arcCache))
        : geometry.arcs.flatMap((polygon) =>
            polygon.map((ringArcs) => buildRing(topology, ringArcs, bbox, scaleFactor, arcCache))
          );
      const allPoints = rings.flat();
      const bounds = getBounds(allPoints);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;

      return {
        provinceKey,
        provinceName: geometry.properties.name,
        isCovered,
        path: rings.map((ring) => ringToPath(ring)).join(' '),
        defaultFill: isCovered ? colors.covered : colors.noCoverage,
        bounds,
        markerPosition: {
          x: centerX,
          y: centerY,
        },
      };
    });

  return {
    features,
    width: mapWidth,
    height: mapHeight,
    defaultViewBox: `0 0 ${mapWidth} ${mapHeight.toFixed(2)}`,
  };
}

function MapPin({ x, y, selected, covered }) {
  const scale = selected ? 1.12 : 1;
  const iconSrc = '/assets/icons/remark-covered.svg';
  const iconAlt = covered ? 'Covered remark' : 'No-covered remark';

  return (
    <g
      transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale})`}
      className="pointer-events-none"
    >
      <foreignObject
        x="-16"
        y="-40"
        width="32"
        height="40"
        overflow="visible"
      >
        <div className="flex h-10 w-8 items-start justify-center">
          <img
            src={iconSrc}
            alt={iconAlt}
            width="32"
            height="40"
            className="h-auto w-full animate-bounce"
            style={{
              filter: covered ? 'none' : 'grayscale(1)',
              opacity: covered ? 1 : 0.8,
            }}
          />
        </div>
      </foreignObject>
    </g>
  );
}

function animateHorizontalScroll(element, targetLeft, duration = 700, onFrameIdChange) {
  if (!element) return 0;

  const startLeft = element.scrollLeft;
  const distance = targetLeft - startLeft;

  if (Math.abs(distance) < 1) {
    element.scrollLeft = targetLeft;
    return 0;
  }

  const startTime = performance.now();

  const easeInOutCubic = (progress) => (
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
  );

  const frame = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    element.scrollLeft = startLeft + distance * easedProgress;

    if (progress < 1) {
      const nextFrameId = window.requestAnimationFrame(frame);
      if (onFrameIdChange) onFrameIdChange(nextFrameId);
    }
  };

  const initialFrameId = window.requestAnimationFrame(frame);
  if (onFrameIdChange) onFrameIdChange(initialFrameId);
  return initialFrameId;
}

export default function MapsCoverageV1({
  name,
  className = '',
  cmsData = null,
}) {
  const sectionRef = useRef(null);
  const mapViewportRef = useRef(null);
  const widgetRef = useRef(null);
  const scrollAnimationRef = useRef(0);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapViewportWidth, setMapViewportWidth] = useState(0);

  const sectionData = cmsData || MAPS_COVERAGE_DATA[name];
  const { colors, businessUnits, provinceMap } = MAP_REGIONS_DATA;

  const mapModel = useMemo(
    () => buildMapFeatures(INDO_TOPOLOGY, provinceMap, colors),
    [provinceMap, colors]
  );

  const buKey = selectedArea ? provinceMap[selectedArea.provinceKey] : null;
  const activeBU = buKey ? businessUnits[buKey] : null;

  const filteredCities = useMemo(() => {
    const availableCities = activeBU?.cities || [];
    if (!searchQuery) return availableCities;
    return availableCities.filter((city) => city.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeBU, searchQuery]);

  const activeFeature = mapModel.features.find(
    (feature) => feature.provinceKey === selectedArea?.provinceKey
  ) || null;

  const horizontalGutter = selectedArea
    ? Math.max(mapViewportWidth / 2 - 40, 0)
    : 0;

  useLayoutEffect(() => {
    const viewport = mapViewportRef.current;
    if (!viewport) return;

    const syncViewportWidth = () => {
      setMapViewportWidth(viewport.clientWidth);
    };

    syncViewportWidth();
    window.addEventListener('resize', syncViewportWidth);

    return () => {
      window.removeEventListener('resize', syncViewportWidth);
    };
  }, []);

  useLayoutEffect(() => {
    const viewport = mapViewportRef.current;
    const widget = widgetRef.current;
    if (!viewport) return;

    if (scrollAnimationRef.current) {
      window.cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = 0;
    }

    const viewportWidth = viewport.clientWidth;

    if (!activeFeature) {
      scrollAnimationRef.current = animateHorizontalScroll(viewport, 0, 500, (frameId) => {
        scrollAnimationRef.current = frameId;
      });
      return;
    }

    const nextGutter = Math.max(viewportWidth / 2 - 40, 0);
    const desktopWidgetOffset = widget && window.innerWidth >= 1024
      ? widget.getBoundingClientRect().width * 0.35
      : 0;
    const nextLeft = Math.max(
      0,
      Math.min(
        nextGutter + activeFeature.markerPosition.x - viewportWidth / 2 + desktopWidgetOffset,
        viewport.scrollWidth - viewport.clientWidth
      )
    );

    scrollAnimationRef.current = animateHorizontalScroll(viewport, nextLeft, 800, (frameId) => {
      scrollAnimationRef.current = frameId;
    });
  }, [activeFeature, horizontalGutter]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!selectedArea || !widget || window.innerWidth >= 1024) return;

    const timeoutId = window.setTimeout(() => {
      const yOffset = -96;
      const nextTop = widget.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: nextTop,
        behavior: 'smooth',
      });
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedArea]);

  if (!sectionData) return null;

  const { config, introData, widgetData } = sectionData;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  const coverageHref = selectedArea
    ? `https://fiber.linknet.co.id/coverage?province=${encodeURIComponent(selectedArea.provinceName)}${selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : ''}`
    : 'https://fiber.linknet.co.id/coverage';

  const handleSelectProvince = (feature) => {
    setSelectedArea({
      provinceKey: feature.provinceKey,
      provinceName: feature.provinceName,
      covered: feature.isCovered,
    });
    setSelectedCity('');
    setSearchQuery('');
  };

  const handleCloseWidget = () => {
    const section = sectionRef.current;

    setSelectedArea(null);
    setSelectedCity('');
    setSearchQuery('');

    if (section && window.innerWidth < 1024) {
      window.setTimeout(() => {
        const yOffset = -40;
        const nextTop = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({
          top: nextTop,
          behavior: 'smooth',
        });
      }, 180);
    }
  };

  return (
    <section
      ref={sectionRef}
      id={`${sectionId}`}
      className={`lnSection__mapsCoverageV1 rounded-[52px] py-16 md:py-24 overflow-hidden bg-no-repeat ${bgPositionClasses} ${bgSizeClass} bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)] ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">
        {introData && (
          <div className="mb-8 md:mb-12">
            <Intro
              as={introData.as || 'h2'}
              label={`${introData.label}`}
              title={introData.title}
              description=""
              align={introData.align || 'left'}
            />
          </div>
        )}

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className={`relative min-w-0 transition-all duration-500 ${selectedArea ? 'w-full lg:flex-1' : 'w-full'}`}>
            {!selectedArea && (
              <div className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-caption-c1 font-medium text-secondary shadow-sm">
                {widgetData?.instructionText || 'Click on a province on the map'}
              </div>
            )}

            <div
              ref={mapViewportRef}
              className={`lnMapsCoverageV1__scrollbar w-full overflow-y-hidden ${
                selectedArea ? 'overflow-x-auto' : 'overflow-x-auto lg:overflow-x-hidden'
              }`}
            >
              <div
                className="min-w-[860px]"
                style={{
                  width: `${mapModel.width + horizontalGutter * 2}px`,
                  minHeight: `${mapModel.height}px`,
                  paddingLeft: `${horizontalGutter}px`,
                  paddingRight: `${horizontalGutter}px`,
                }}
              >
                <svg
                  viewBox={mapModel.defaultViewBox}
                  className="block h-auto"
                  style={{
                    width: `${mapModel.width}px`,
                    height: `${mapModel.height}px`,
                  }}
                  role="img"
                  aria-label="Indonesia coverage map"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g>
                    {mapModel.features.map((feature) => {
                      const isSelected = selectedArea?.provinceKey === feature.provinceKey;
                      const fillColor = feature.isCovered
                        ? (isSelected ? '#0f7b66' : feature.defaultFill)
                        : feature.defaultFill;

                      return (
                        <path
                          key={feature.provinceKey}
                          d={feature.path}
                          fill={fillColor}
                          stroke={isSelected ? '#ffb200' : '#ffffff'}
                          strokeWidth={isSelected ? 2.6 : 1.1}
                          className="cursor-pointer transition-all duration-200 hover:brightness-95 focus:outline-none"
                          fillRule="evenodd"
                          vectorEffect="non-scaling-stroke"
                          role="button"
                          tabIndex={0}
                          aria-label={feature.provinceName}
                          onClick={() => handleSelectProvince(feature)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleSelectProvince(feature);
                            }
                          }}
                        />
                      );
                    })}
                  </g>
                  <g aria-hidden="true">
                    {activeFeature && (
                      <MapPin
                        x={activeFeature.markerPosition.x}
                        y={activeFeature.markerPosition.y}
                        selected
                        covered={activeFeature.isCovered}
                      />
                    )}
                  </g>
                </svg>
              </div>
            </div>

          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              selectedArea ? 'max-h-[1000px] opacity-100 lg:w-[400px]' : 'max-h-0 opacity-0 lg:w-0'
            }`}
          >
            {selectedArea && (
              <div
                ref={widgetRef}
                className={`relative z-20 w-full rounded-[24px] lg:w-[400px] ${
                  selectedArea.covered ? 'bg-green-marble' : 'bg-neutral-50'
                }`}
              >
                <div className="flex w-full items-center justify-center rounded-t-[24px] py-3">
                  <span className={`text-caption-c1 font-medium uppercase tracking-widest ${selectedArea.covered ? 'text-white' : 'text-neutral-600'}`}>
                    {selectedArea.covered ? widgetData?.statusCovered : widgetData?.statusNotCovered}
                  </span>
                </div>

                <div className="flex flex-col rounded-[24px] rounded-t-[24px] border-x border border-[#f3f3f3] bg-white p-[20px] lg:p-[24px]">
                  <div className="mb-2 flex items-center justify-between pb-2">
                    <h3 className="text-body-b3 font-bold text-black">{widgetData?.title || 'Coverage Details'}</h3>
                    <Button
                      onClick={handleCloseWidget}
                      variant="secondary-plain"
                      size="md"
                      className="!p-0"
                      iconRight={<Icon name="close" />}
                    />
                  </div>

                  <div className="flex h-full flex-1 flex-col">
                    <div className="mb-1 text-caption-c1 font-medium uppercase text-secondary">
                      {activeBU ? activeBU.label : widgetData?.regionLabel}
                    </div>
                    <h4 className="mb-6 text-headline-h5 font-bold text-black">
                      {activeBU ? activeBU.title : selectedArea.provinceName}
                    </h4>

                    {selectedArea.covered ? (
                    <>
                      <div className="relative mb-4">
                        <input
                          type="text"
                          placeholder={widgetData?.searchPlaceholder || 'Search city'}
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          className="w-full rounded-xl border border-neutral-100 py-3 pl-10 pr-4 text-body-b4 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 hover:border-primary"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                          <Icon name="search" style={{ '--icon-size': '20px' }} />
                        </div>
                      </div>

                      <div className="lnMapsCoverageV1__listCity mb-4 custom-scrollbar  flex max-h-[240px] flex-col overflow-y-auto pr-1 lg:max-h-[220px]">
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <button
                              type="button"
                              key={city}
                              onClick={() => setSelectedCity(city)}
                              aria-pressed={selectedCity === city}
                              className={`group flex w-full appearance-none items-center gap-3 rounded-[12px] border bg-transparent px-4 py-3 text-left transition-all focus:outline-none ${
                                selectedCity === city ? 'border-primary bg-yellow-50' : 'border-white hover:border-neutral-100'
                              }`}
                            >
                              <span className="flex-1 text-body-b4 font-medium text-neutral-700">{city}</span>
                              {selectedCity === city && (
                                <Icon name="check" className="text-warning" style={{ '--icon-size': '24px' }} />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="py-8 text-center text-body-b5 italic text-neutral-400">
                            {widgetData?.noCityFound || 'No cities found.'}
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <LinknetLink
                          href={coverageHref}
                          variant="primary"
                          size="lg"
                          className="w-full justify-center"
                        >
                          {widgetData?.ctaText || 'Get a Free Quote'}
                        </LinknetLink>
                      </div>
                    </>
                    ) : (
                      <div className="py-10 text-center">
                        <img
                          src="/assets/illustrations/ill-search-not-found.svg"
                          alt="Not Found"
                          className="mx-auto mb-4 h-auto w-24"
                        />
                        <p className="px-4 text-body-b5 italic text-secondary">
                          {widgetData?.notCoveredMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
