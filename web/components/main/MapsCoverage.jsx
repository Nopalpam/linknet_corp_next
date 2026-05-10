'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Intro from '../base/section/Intro';
import LinknetLink from '../base/Link';
import Button from '../base/Button';
import Icon from '../base/Icon';

// Import Highcharts Core
import Highcharts from 'highcharts';

// Import data konten, konstanta, dan TOPOLOGY JSON langsung
import { MAPS_COVERAGE_DATA } from '../../data/components/mapsCoverage';
import { MAP_REGIONS_DATA } from '../../data/constants/mapRegions';
import INDO_TOPOLOGY from '../../data/constants/id-all.topo.json';
import { hasIntroContent } from '../../../shared/presentation/intro';

export default function MapsCoverage({
  name,
  cmsData = null,
  className = ""
}) {
  const mapContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const topologyRef = useRef(null);
  const widgetRef = useRef(null);
  const sectionRef = useRef(null);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sectionData = cmsData || MAPS_COVERAGE_DATA[name];
  const { colors, businessUnits, provinceMap } = MAP_REGIONS_DATA;

  const filteredCities = useMemo(() => {
    const buKey = selectedArea ? provinceMap[selectedArea.provinceKey] : null;
    const cities = buKey ? businessUnits[buKey]?.cities : [];
    if (!searchQuery) return cities;
    return cities.filter(city =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedArea, searchQuery, businessUnits, provinceMap]);

  useEffect(() => {
    if (!sectionData || !mapContainerRef.current) return;

    const loadMapAndRender = async () => {
      if (typeof window !== 'undefined') {
        if (!Highcharts.maps) {
          try {
            const HCMapModule = await import('highcharts/modules/map');
            const initMapModule = HCMapModule.default || HCMapModule;
            if (typeof initMapModule === 'function') initMapModule(Highcharts);
          } catch (err) {
            console.error("Gagal memuat Highcharts Map Module:", err);
          }
        }
      }

      if (typeof Highcharts.mapChart !== 'function') return;

      const topology = INDO_TOPOLOGY;
      topologyRef.current = topology;

      const data = topology.objects.default.geometries.map(g => {
        const key = g.properties['hc-key'];
        const covered = !!provinceMap[key];
        return { 'hc-key': key, name: g.properties.name, value: covered ? 1 : 0 };
      });

      chartInstanceRef.current = Highcharts.mapChart(mapContainerRef.current, {
        chart: {
          map: topology,
          backgroundColor: 'transparent',
          spacing: [0, 0, 0, 0],
          mapView: { minZoom: 1, maxZoom: 1 }
        },
        title: { text: '' },
        exporting: { enabled: false },
        mapNavigation: { enabled: false },
        colorAxis: {
          dataClasses: [
            { from: 1, to: 1, color: colors.covered, name: 'Covered' },
            { from: 0, to: 0, color: colors.noCoverage, name: 'No Coverage' }
          ]
        },
        legend: { enabled: false },
        series: [{
          id: 'base-provinces',
          data,
          joinBy: ['hc-key', 'hc-key'],
          allowPointSelect: true,
          states: {
            hover: { borderColor: '#333', brightness: 0.1 },
            select: { enabled: true, borderColor: colors.covered, borderWidth: 2 }
          },
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                const key = this['hc-key'];
                const covered = this.value === 1;

                setSelectedArea({
                  provinceName: this.name,
                  provinceKey: key,
                  covered: covered
                });
                setSelectedCity('');
                setSearchQuery('');

                drawActiveOutline(key, colors.covered, chartInstanceRef.current, topologyRef.current);

                if (window.innerWidth < 1024) {
                    setTimeout(() => {
                        if (widgetRef.current) {
                            const yOffset = -120;
                            const element = widgetRef.current;
                            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                    }, 150);
                }
              }
            }
          }
        }]
      });
    };

    loadMapAndRender();
    return () => chartInstanceRef.current?.destroy();
  }, [sectionData, colors, provinceMap]);

  const clearActiveOutline = (chart) => {
    if (chart) {
      const oldGlow = chart.get('active-outline-glow');
      const oldDash = chart.get('active-outline-dash');
      if (oldGlow) oldGlow.remove(false);
      if (oldDash) oldDash.remove(false);
      chart.redraw();
    }
  };

  const drawActiveOutline = (hcKey, color, chart, topology) => {
    clearActiveOutline(chart);
    if (!topology || !chart) return;
    const allLines = Highcharts.geojson(topology, 'mapline');
    const selectedLines = allLines.filter(f => f.properties?.['hc-key'] === hcKey);

    if (selectedLines.length) {
      chart.addSeries({
        id: 'active-outline-glow',
        type: 'mapline',
        data: selectedLines,
        color: 'rgba(0, 155, 119, 0.2)',
        lineWidth: 8,
        enableMouseTracking: false,
        zIndex: 7
      }, false);

      chart.addSeries({
        id: 'active-outline-dash',
        type: 'mapline',
        linkedTo: 'active-outline-glow',
        data: selectedLines,
        color: color,
        lineWidth: 2,
        dashStyle: 'ShortDot',
        enableMouseTracking: false,
        zIndex: 8
      }, false);
      chart.redraw();
    }
  };

  const handleCloseWidget = () => {
    setSelectedArea(null);
    setSelectedCity('');
    setSearchQuery('');
    clearActiveOutline(chartInstanceRef.current);
    chartInstanceRef.current?.getSelectedPoints().forEach(p => p.select(false, false));

    if (window.innerWidth < 1024) {
        setTimeout(() => {
            if (sectionRef.current) {
                const yOffset = -40;
                const element = sectionRef.current;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 150);
    }
  };

  if (!sectionData) return null;

  const { config = {}, id, introData, widgetData } = sectionData;
  const {
    sectionId = id,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };
  const buKey = selectedArea ? provinceMap[selectedArea.provinceKey] : null;
  const activeBU = buKey ? businessUnits[buKey] : null;
  const coverageHref = selectedArea
    ? `https://fiber.linknet.co.id/coverage?province=${encodeURIComponent(selectedArea.provinceName)}${selectedCity ? `&city=${encodeURIComponent(selectedCity)}` : ''}`
    : 'https://fiber.linknet.co.id/coverage';

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`lnSection__mapsCoverage bg-light-2 rounded-[52px] py-16 md:py-24 overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {hasIntroContent(introData) && (
          <div className="mb-8 md:mb-12">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

        <div className="relative flex flex-col lg:flex-row gap-8 items-start w-full min-h-[500px]">

            {/* Map Wrapper: Container dipisahkan antara yang relative (untuk label) dan scrollable (untuk maps) */}
            <div className={`
                relative transition-all duration-500 min-w-0
                ${selectedArea ? 'w-full lg:flex-1' : 'w-full'}
            `}>
                {!selectedArea && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-caption-c1 text-secondary z-10 pointer-events-none bg-white/90 px-6 py-2.5 rounded-full shadow-sm whitespace-nowrap">
                      {widgetData?.instructionText || "Klik salah satu provinsi pada peta"}
                  </div>
                )}

                {/* Scroll Container dipindahkan ke layer dalam */}
                <div className="lnMapsCoverage__scrollbar w-full overflow-x-auto overflow-y-hidden">
                    <div
                        ref={mapContainerRef}
                        className="min-w-[800px] lg:min-w-full w-full h-[450px] md:h-[600px] lg:h-[520px] relative"
                    ></div>
                </div>
            </div>

            {/* --- WIDGET DETAIL --- */}
            <div className={`
                flex flex-col transition-colors duration-500
                ${selectedArea ? 'opacity-100 translate-x-0 relative z-20' : 'opacity-0 translate-x-10 absolute pointer-events-none'}
                w-full lg:w-[400px] ${selectedArea?.covered ? 'bg-green-marble' : 'bg-neutral-50'} rounded-[24px]
            `}>
                <div
                    className={`
                        rounded-t-[24px] py-3 w-full flex items-center justify-center
                    `}
                >
                    <span className={`font-medium text-caption-c1 uppercase tracking-widest ${selectedArea?.covered ? 'text-white' : 'text-neutral-600'}`}>
                        {selectedArea?.covered ? widgetData?.statusCovered : widgetData?.statusNotCovered}
                    </span>
                </div>

                <div
                    ref={widgetRef}
                    className="bg-white border-x border-b border-neutral-50 rounded-[24px] p-6 lg:p-8 flex flex-col animate-fade-in"
                >
                    <div className="flex items-center justify-between mb-2 pb-2">
                        <h3 className="text-body-b3 font-bold text-black">{widgetData?.title || "Coverage Details"}</h3>
                        <Button
                            onClick={handleCloseWidget}
                            variant="secondary-plain"
                            size="md"
                            className="!p-0"
                            iconRight={<Icon name="close" />}
                        />
                    </div>

                    {selectedArea && (
                        <div className="flex flex-col h-full flex-1">
                            <div className="text-caption-c1 font-medium text-secondary mb-1 uppercase">
                               {activeBU ? activeBU.label : widgetData?.regionLabel}
                            </div>
                            <h4 className="text-headline-h5 font-bold text-black mb-6">
                                {activeBU ? activeBU.title : selectedArea.provinceName}
                            </h4>

                            {selectedArea.covered ? (
                                <>
                                    <div className="relative mb-4">
                                        <input
                                            type="text"
                                            placeholder={widgetData?.searchPlaceholder || "Search city"}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-neutral-100 rounded-xl text-body-b4 focus:outline-none transition-all focus:border-primary hover:border-primary focus:ring-1 focus:ring-primary/2 focus:outline-none"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                            <Icon name="search" style={{ "--icon-size": "20px" }} />
                                        </div>
                                    </div>

                                    <div className="lnMapsCoverage__scrollbar flex flex-col mb-8 max-h-[240px] lg:max-h-[252px] overflow-y-scroll pr-1">
                                        {filteredCities.length > 0 ? (
                                            filteredCities.map((city) => (
                                                <label
                                                    key={city}
                                                    className={`flex items-center gap-3 px-4 py-3 border transition-all rounded-[12px] cursor-pointer group ${
                                                        selectedCity === city
                                                            ? 'border-primary bg-yellow-50'
                                                            : 'border-white hover:border-neutral-100'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="coverage-city"
                                                        value={city}
                                                        checked={selectedCity === city}
                                                        onChange={() => setSelectedCity(city)}
                                                        className="sr-only"
                                                    />
                                                    <span className="text-body-b4 text-neutral-700 font-medium flex-1">{city}</span>
                                                    {selectedCity === city && (
                                                        <Icon name="check" className="text-warning" style={{ '--icon-size': '24px' }} />
                                                    )}
                                                </label>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-body-b5 text-neutral-400 italic">
                                                {widgetData?.noCityFound || "No cities found."}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <LinknetLink
                                            href={coverageHref}
                                            variant="primary"
                                            size='lg'
                                            className="w-full justify-center"
                                        >
                                            {widgetData?.ctaText || "Get a Free Quote"}
                                        </LinknetLink>
                                    </div>
                                </>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="info" className="text-neutral-400" size={32} />
                                    </div>
                                    <p className="text-body-b5 text-secondary mb-8 italic px-4">
                                        {widgetData?.notCoveredMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
      <style jsx>{`
        .lnMapsCoverage__scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .lnMapsCoverage__scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .lnMapsCoverage__scrollbar::-webkit-scrollbar-thumb {
          background: var(--bg-warning);
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
}
