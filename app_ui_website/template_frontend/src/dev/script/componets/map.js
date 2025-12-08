(function () {
  // ===== Helpers
  const qs = (sel, ctx=document) => ctx.querySelector(sel);
  const getVar = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };

  const GREEN = getVar('--color-green-500', '#009b77');
  const NEUTRAL_200 = getVar('--neutral-200', '#8ad1c0');

  // ===== DOM refs
  const containerEl = qs('#coverage-container');
  const widget = qs('#coverage-widget');
  const detailBox = qs('#coverage-detail');
  const hint = qs('#coverage-hint');
  const closeBtn = qs('#coverage-close');

  // ===== Data from HTML JSON
  const BUSINESS_UNITS = JSON.parse(qs('#business_units').textContent);
  const BU_BY_PROVINCE = JSON.parse(qs('#province_bu_map').textContent);

  function openWidgetOnce() {
    if (!containerEl.classList.contains('with-widget')) {
      containerEl.classList.add('with-widget');
      widget.setAttribute('aria-hidden', 'false');
      widget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function closeWidget() {
    containerEl.classList.remove('with-widget');
    widget.setAttribute('aria-hidden', 'true');
    if (hint) hint.style.display = '';
    detailBox.innerHTML = '';
    clearActiveOutline();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeWidget);

  function buildCtaHref(provinceName) {
    return `https://linknetfiber.id/coverage?province=${encodeURIComponent(provinceName)}`;
  }

  function renderWidget({ provinceName, provinceKey, covered }) {
    openWidgetOnce();
    if (hint) hint.style.display = 'none';

    const buKey = BU_BY_PROVINCE[provinceKey];
    const bu = buKey ? BUSINESS_UNITS[buKey] : null;

    let html = '';
    if (bu) {
      html += `<div class="bu-label">${bu.label}</div>`;
      html += `<h4 class="zone-title text-headline-h5">${bu.title}</h4>`;
    } else {
      html += `<div class="bu-label">Area</div>`;
      html += `<h4 class="zone-title text-headline-h5">${provinceName}</h4>`;
    }

    if (covered) {
      html += `<div class="badge badge--ok">Covered</div>`;
      if (bu && Array.isArray(bu.cities) && bu.cities.length) {
        html += `<ul class="labelCity">${bu.cities.map(c => `<li>${c}</li>`).join('')}</ul>`;
        }
      html += `<div class="mt-4"><a class="btn btn-md btn-secondary-outline font-medium w-100" href="${buildCtaHref(provinceName)}">Get a Free Quote</a></div>`;
    } else {
    //   html += `<div class="badge badge--no">No Coverage</div>`;
      html += `<p class="muted" style="margin:8px 0 0;">Area ini belum tersedia.</p>`;
      html += `<div class="mt-4"><span class="btn btn-md btn-disabled w-100" role="button" aria-disabled="true">Get a Free Quote</span></div>`;
    }

    detailBox.innerHTML = html;
  }

  // ===== Highcharts Map
  let _topologyRef = null;
  let _chartRef = null;
  let _lastSelectedPoint = null;

  fetch('https://code.highcharts.com/mapdata/countries/id/id-all.topo.json')
    .then(r => r.json())
    .then(topology => {
      _topologyRef = topology;
      const data = topology.objects.default.geometries.map(g => {
        const key = g.properties['hc-key'];
        const covered = !!BU_BY_PROVINCE[key];
        return { 'hc-key': key, name: g.properties.name, value: covered ? 1 : 0 };
      });

      _chartRef = Highcharts.mapChart('indo-map', {
        chart: {
          map: topology,
          backgroundColor: 'rgba(0,0,0,0)',
          // Lock zoom level
          mapView: { minZoom: 1, maxZoom: 1 }
        },
        title: { text: '' },
        exporting: { enabled: false },

        // Disable all zoom gestures
        mapNavigation: {
          enabled: false,
          enableButtons: false,
          enableDoubleClickZoom: false,
          enableDoubleClickZoomTo: false,
          enableMouseWheelZoom: false,
          enableTouchZoom: false
        },
        zooming: {
          mouseWheel: false,
          singleTouch: false,
          doubleClick: false,
          pinchType: ''
        },

        colorAxis: {
          dataClasses: [
            { from: 1, to: 1, color: GREEN, name: 'Covered' },
            { from: 0, to: 0, color: NEUTRAL_200, name: 'No Coverage' }
          ]
        },
        legend: {
          enabled: true,
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          backgroundColor: 'transparent',
          itemStyle: { fontSize: '12px', color: '#4B5563' },
          symbolHeight: 12,
          symbolWidth: 12,
          margin: 12
        },

        series: [{
          id: 'base-provinces',
          data,
          joinBy: ['hc-key', 'hc-key'],
          allowPointSelect: true,
          states: {
            hover: { borderColor: '#333', brightness: 0.1 },
            select: { enabled: true, borderColor: GREEN, borderWidth: 2, brightness: 0.05 }
          },
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                const key = this['hc-key'];
                const covered = this.value === 1;

                if (_lastSelectedPoint && _lastSelectedPoint !== this) {
                  _lastSelectedPoint.select(false, false);
                }
                this.select(true, false);
                _lastSelectedPoint = this;

                drawActiveOutline(key, GREEN);
                renderWidget({ provinceName: this.name, provinceKey: key, covered });
              }
            }
          }
        }]
      });
    });

  function clearActiveOutline() {
    if (_chartRef) {
      const old = _chartRef.get('active-outline');
      if (old) old.remove(false);
      _chartRef.redraw();
    }
  }

  function drawActiveOutline(hcKey, color) {
    clearActiveOutline();
    if (!_topologyRef || !_chartRef) return;

    const allLines = Highcharts.geojson(_topologyRef, 'mapline');
    const selectedLines = allLines.filter(f => f.properties && f.properties['hc-key'] === hcKey);
    if (selectedLines.length) {
      // Glow layer
      _chartRef.addSeries({
        id: 'active-outline',
        type: 'mapline',
        data: selectedLines,
        color: color.replace(')', ',.35)').replace('rgb', 'rgba'), // fallback tweak if rgb(), else below:
        lineWidth: 6,
        enableMouseTracking: false,
        zIndex: 7
      }, false);

      // If not rgba above, use generic rgba fallback:
      const outlineColor = color.startsWith('#') ? color : GREEN;

      // Dashed layer
      _chartRef.addSeries({
        type: 'mapline',
        linkedTo: 'active-outline',
        data: selectedLines,
        color: outlineColor,
        lineWidth: 2,
        dashStyle: 'ShortDot',
        enableMouseTracking: false,
        zIndex: 8
      }, false);

      _chartRef.redraw();
    }
  }
})();
