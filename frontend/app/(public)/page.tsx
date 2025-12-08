'use client';

export default function HomePage() {
  return (
    <>
      {/* Hero Sliders Section */}
      <section className="lnSection__hero" id="lnSection__hero">
        <div className="p-2 pt-1">
          <div className="swiper lnHeroSwiper">
            <div className="swiper-wrapper">
              {/* Slide 1 */}
              <div className="swiper-slide">
                <div className="lnHero" aria-label="Our Vision">
                  <div className="lnHero__media" aria-hidden="true">
                    <img src="/assets_frontend/assets/bg/621.jpg" className="bgPosition__right" alt="" />
                  </div>
                  <div className="lnHero__gradient" aria-hidden="true"></div>

                  <div className="lnHero__content">
                    <div className="lnHero__text">
                      <span className="lnHero__pill text-caption-c1 font-medium mb-2" style={{ display: 'none' }}>
                        🇮🇩 Our Mission
                      </span>
                      <h1 className="lnHero__title text-headline-h2 font-bold">
                        🇮🇩 Happy 80th Indonesia! From the Spirit of Independence, We Move Forward for the Future.
                      </h1>
                      <p className="lnHero__desc text-body-b4 font-regular w-75">
                        Together we move forward, building a future full of strength and prosperity.
                      </p>
                    </div>
                    <div className="lnHero__actions" style={{ display: 'none' }}>
                      <a className="btn btn-lg btn-secondary-outline-reverse with-icon with-icon-end" href="#" aria-label="Get to Know Us">
                        <span>Get to Know Us</span>
                        <span className="icon icon--24" style={{ '--icon-src': 'url(/assets_frontend/assets/icons/arrow-top-right.svg)' } as React.CSSProperties} aria-hidden="true"></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="swiper-slide">
                <div className="lnHero" aria-label="Our Network">
                  <div className="lnHero__media" aria-hidden="true">
                    <img src="/assets_frontend/assets/bg/hero-2.jpg" alt="" />
                  </div>
                  <div className="lnHero__gradient" aria-hidden="true"></div>

                  <div className="lnHero__content">
                    <div className="lnHero__text">
                      <span className="lnHero__pill text-caption-c1 font-medium mb-2">🇮🇩 Our Mission</span>
                      <h1 className="lnHero__title text-headline-h2 font-bold">
                        Improving Lives and Supporting Indonesia&apos;s Digital Growth
                      </h1>
                      <p className="lnHero__desc text-body-b4 font-regular w-75">
                        Linknet is dedicated to improving lives and supporting Indonesia&apos;s digital growth by delivering smart, reliable technology infrastructure through its three main business units
                      </p>
                    </div>
                    <div className="lnHero__actions">
                      <a className="btn btn-lg btn-secondary-outline-reverse with-icon with-icon-end" href="#">
                        <span>Get to Know Us</span>
                        <span className="icon icon--24" style={{ '--icon-src': 'url(/assets_frontend/assets/icons/arrow-top-right.svg)' } as React.CSSProperties} aria-hidden="true"></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 */}
              <div className="swiper-slide">
                <div className="lnHero" aria-label="Innovation">
                  <div className="lnHero__media" aria-hidden="true">
                    <img src="/assets_frontend/assets/bg/2806.jpg" alt="" />
                  </div>
                  <div className="lnHero__gradient" aria-hidden="true"></div>

                  <div className="lnHero__content">
                    <div className="lnHero__text">
                      <span className="lnHero__pill text-caption-c1 font-medium mb-2">Our Vision</span>
                      <h1 className="lnHero__title text-headline-h2 font-bold">
                        Connecting 4 Million Homes, On Track to 8.4 Million by 2027
                      </h1>
                      <p className="lnHero__desc text-body-b4 font-regular w-75">
                        Link Net Continues to Expand Its Digital Footprint for a Closer, More Connected Future.
                      </p>
                    </div>
                    <div className="lnHero__actions">
                      <a className="btn btn-lg btn-secondary-outline-reverse with-icon with-icon-end" href="#">
                        <span>Discover More</span>
                        <span className="icon icon--24" style={{ '--icon-src': 'url(/assets_frontend/assets/icons/arrow-top-right.svg)' } as React.CSSProperties} aria-hidden="true"></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 */}
              <div className="swiper-slide">
                <div className="lnHero" aria-label="Innovation">
                  <div className="lnHero__media" aria-hidden="true">
                    <img src="/assets_frontend/assets/bg/top-view-business-people-writing-mind-map-while-brainstorm-idea-convocation.jpg" alt="" />
                  </div>
                  <div className="lnHero__gradient" aria-hidden="true"></div>

                  <div className="lnHero__content">
                    <div className="lnHero__text">
                      <span className="lnHero__pill text-caption-c1 font-medium mb-2">🤝 We&apos;re Hiring</span>
                      <h1 className="lnHero__title text-headline-h2 font-bold">
                        Let&apos;s Join Management Trainee Generation 6
                      </h1>
                      <p className="lnHero__desc text-body-b4 font-regular w-75">
                        Link Net Management Trainee Program is a comprehensive program that enables the organization to develop and grow fit capable young leaders for a managerial role in the company.
                      </p>
                    </div>
                    <div className="lnHero__actions">
                      <a className="btn btn-lg btn-secondary-outline-reverse with-icon with-icon-end" href="#">
                        <span>Apply Now</span>
                        <span className="icon icon--24" style={{ '--icon-src': 'url(/assets_frontend/assets/icons/arrow-top-right.svg)' } as React.CSSProperties} aria-hidden="true"></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="lnHeroSwiper-nav" aria-label="Hero navigation">
              <div className="lnHeroSwiper-nav-prev" role="button" tabIndex={0} aria-label="Previous slide">
                <img src="/assets_frontend/assets/icons/slidersItem/arrowNavigationLeft.svg" alt="" width="22" height="22" />
              </div>
              <div className="lnHeroSwiper-nav-next" role="button" tabIndex={0} aria-label="Next slide">
                <img src="/assets_frontend/assets/icons/slidersItem/arrowNavigationRight.svg" alt="" width="22" height="22" />
              </div>
            </div>
            <div className="swiper-pagination" aria-label="Pagination"></div>
          </div>

          {/* Indicators */}
          <div className="container-lg">
            <div id="lnHeroIndicators" className="lnHeroIndicators" style={{ '--indicator-count': 4 } as React.CSSProperties} aria-label="Slide indicators">
              <button type="button" className="lnHeroIndicator is-active" data-index="0">
                <div className="lnHeroIndicator__head">
                  <span className="lnHeroIndicator__dot"></span>
                  <span className="lnHeroIndicator__label">Indonesia Independence Day</span>
                </div>
                <div className="lnHeroIndicator__track">
                  <div className="lnHeroIndicator__bar"></div>
                </div>
              </button>
              <button type="button" className="lnHeroIndicator" data-index="1">
                <div className="lnHeroIndicator__head">
                  <span className="lnHeroIndicator__dot"></span>
                  <span className="lnHeroIndicator__label">Indonesia&apos;s Digital Growth</span>
                </div>
                <div className="lnHeroIndicator__track">
                  <div className="lnHeroIndicator__bar"></div>
                </div>
              </button>
              <button type="button" className="lnHeroIndicator" data-index="2">
                <div className="lnHeroIndicator__head">
                  <span className="lnHeroIndicator__dot"></span>
                  <span className="lnHeroIndicator__label">4M Homepass</span>
                </div>
                <div className="lnHeroIndicator__track">
                  <div className="lnHeroIndicator__bar"></div>
                </div>
              </button>
              <button type="button" className="lnHeroIndicator" data-index="3">
                <div className="lnHeroIndicator__head">
                  <span className="lnHeroIndicator__dot"></span>
                  <span className="lnHeroIndicator__label">Management Trainee Gen 6</span>
                </div>
                <div className="lnHeroIndicator__track">
                  <div className="lnHeroIndicator__bar"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About with USP Section */}
      <section className="lnSection lnSection__aboutWithUSP" style={{ background: 'url(/assets_frontend/assets/bg/map-indonesia-dots.svg)' }}>
        <div className="container">
          {/* Intro */}
          <div className="lnIntro">
            <div className="lnIntro__content">
              <div className="lnIntro__label text-caption-c1 font-bold">OUR PURPOSE</div>
              <div className="lnIntro__title text-headline-h2 font-bold">
                We LINK the nation for better lives
              </div>
              <div className="lnIntro__desc text-body-b4 font-regular">
                Through Hybrid Fiber Coaxial (HFC) and Fiber To The Home (FTTH) networks,
                Linknet provides reliable internet, multimedia, and business solutions to over 4
                million homepasses in 47+ cities
              </div>
            </div>
            <div className="lnIntro__actions">
              <a className="btn btn-md btn-secondary-outline" href="#">
                <span>Get to Know Us</span>
                <span className="icon icon--18 icon--neutral-900" style={{ '--icon-src': 'url(/assets_frontend/assets/icons/arrow-top-right.svg)' } as React.CSSProperties} aria-hidden="true"></span>
              </a>
            </div>
          </div>

          {/* USP */}
          <div className="lnUSP row g-4 g-lg-5 mt-4 mt-lg-5">
            <div className="lnUSP__item col-12 col-md-3">
              <div className="lnUSP__icon">
                <img src="/assets_frontend/assets/icons/usp/home.svg" alt="" width="36" height="36" />
              </div>
              <div className="lnUSP__body">
                <h3 className="lnUSP__title text-headline-h5 font-bold">4M+ Homepasses</h3>
                <p className="lnUSP__desc text-body-b5">Spread across more than 47 major cities in Indonesia</p>
              </div>
            </div>

            <div className="lnUSP__item col-12 col-md-3">
              <div className="lnUSP__icon">
                <img src="/assets_frontend/assets/icons/usp/aniversary.svg" alt="" width="36" height="36" />
              </div>
              <div className="lnUSP__body">
                <h3 className="lnUSP__title text-headline-h5 font-bold">25 Years of Service</h3>
                <p className="lnUSP__desc text-body-b5">Since 1996, we have been present to build Indonesian connectivity.</p>
              </div>
            </div>

            <div className="lnUSP__item col-12 col-md-3">
              <div className="lnUSP__icon">
                <img src="/assets_frontend/assets/icons/usp/business.svg" alt="" width="36" height="36" />
              </div>
              <div className="lnUSP__body">
                <h3 className="lnUSP__title text-headline-h5 font-bold">3 Pillars of Business</h3>
                <p className="lnUSP__desc text-body-b5">FiberCo, EnterpriseCo, and MediaCo for complete solutions</p>
              </div>
            </div>

            <div className="lnUSP__item col-12 col-md-3">
              <div className="lnUSP__icon">
                <img src="/assets_frontend/assets/icons/usp/location.svg" alt="" width="36" height="36" />
              </div>
              <div className="lnUSP__body">
                <h3 className="lnUSP__title text-headline-h5 font-bold">3 Strategic Headend</h3>
                <p className="lnUSP__desc text-body-b5">Located in the business center of Jakarta, Surabaya, and Bali</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Tab Section */}
      <section className="lnSection lnSection__businessTab">
        <div className="container">
          <div className="lnIntro lnIntro--center mb-4">
            <p className="lnIntro__label text-caption-c1 font-bold">EXPLORE OUR BUSINESS</p>
            <h2 className="lnIntro__title text-headline-h2 font-bold">Driving Better Lives Through Innovation</h2>
          </div>

          <div className="lnTabsWrapper">
            {/* Tabs */}
            <div className="swiper lnTabs lnTabs--center" aria-label="Business Tabs">
              <div className="swiper-wrapper">
                <button className="swiper-slide lnTab is-active" type="button" role="tab" aria-selected={true} data-target="#panel-enterprise">
                  <span className="lnTab__label text-body-b4 font-medium">Enterprise</span>
                </button>
                <button className="swiper-slide lnTab" type="button" role="tab" aria-selected={false} data-target="#panel-fiberco">
                  <span className="lnTab__label text-body-b4 font-medium">FiberCo</span>
                </button>
                <button className="swiper-slide lnTab" type="button" role="tab" aria-selected={false} data-target="#panel-mediaco">
                  <span className="lnTab__label text-body-b4 font-medium">MediaCo</span>
                </button>
              </div>
            </div>

            {/* Panels */}
            <div className="lnTabPanels" role="tablist" aria-live="polite">
              {/* Panel 1 - Enterprise */}
              <div className="lnTabPanel is-active" id="panel-enterprise" role="tabpanel">
                <article className="bizHero" aria-label="Enterprise">
                  <div className="bizHero__media">
                    <img src="/assets_frontend/assets/bg/bg-enterprise.jpg" className="bgPosition__right" alt="" />
                  </div>
                  <div className="bizHero__gradient"></div>

                  <div className="bizHero__overlay">
                    <div className="row g-3 h-100">
                      <div className="col-12 col-md-6 order-1 order-md-2 bizHero__col--brand d-flex justify-content-end">
                        <div className="bizHero__brand">
                          <img src="/assets_frontend/assets/logos/logo-enterprise.svg" alt="Linknet Enterprise" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 order-2 order-md-1 bizHero__col--content d-flex flex-column">
                        <div className="bizHero__content">
                          <h3 className="text-headline-h2 font-bold">B2B Connectivity & Data Communication</h3>
                          <p className="text-body-b4 font-regular">
                            a trusted provider of integrated technology, data communication, and connectivity solutions that help businesses navigate the demands of digital transformation.
                          </p>
                        </div>
                        <div className="bizHero__cta mt-auto">
                          <a className="btn btn-lg btn-secondary-outline-reverse" href="#">
                            <span>Learn More</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Panel 2 - FiberCo */}
              <div className="lnTabPanel" id="panel-fiberco" role="tabpanel">
                <article className="bizHero" aria-label="FiberCo">
                  <div className="bizHero__media">
                    <img src="/assets_frontend/assets/bg/hero-2.jpg" alt="" />
                  </div>
                  <div className="bizHero__gradient"></div>

                  <div className="bizHero__overlay">
                    <div className="row g-3 h-100">
                      <div className="col-12 col-md-6 order-1 order-md-2 bizHero__col--brand d-flex justify-content-end">
                        <div className="bizHero__brand">
                          <img src="/assets_frontend/assets/logos/logo-fiberco-white.png" alt="Linknet FiberCo" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 order-2 order-md-1 bizHero__col--content d-flex flex-column">
                        <div className="bizHero__content">
                          <h3 className="text-headline-h2 font-bold">Discover the Next Level of Internet Speed with Fiber Optics</h3>
                          <p className="text-body-b4 font-regular">
                            a trusted provider of integrated technology, data communication, and connectivity solutions that help businesses navigate the demands of digital transformation.
                          </p>
                        </div>
                        <div className="bizHero__cta mt-auto">
                          <a className="btn btn-lg btn-secondary-outline-reverse" href="#">
                            <span>Learn More</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Panel 3 - MediaCo */}
              <div className="lnTabPanel" id="panel-mediaco" role="tabpanel">
                <article className="bizHero" aria-label="MediaCo">
                  <div className="bizHero__media">
                    <img src="/assets_frontend/assets/bg/close-up-hand-holding-tv-remote-control-home.jpg" alt="" />
                  </div>
                  <div className="bizHero__gradient"></div>

                  <div className="bizHero__overlay">
                    <div className="row g-3 h-100">
                      <div className="col-12 col-md-6 order-1 order-md-2 bizHero__col--brand d-flex justify-content-end">
                        <div className="bizHero__brand">
                          <img src="/assets_frontend/assets/logos/logo-mediaco.svg" alt="Linknet MediaCo" />
                        </div>
                      </div>
                      <div className="col-12 col-md-6 order-2 order-md-1 bizHero__col--content d-flex flex-column">
                        <div className="bizHero__content">
                          <h3 className="text-headline-h2 font-bold">Your Gateway to Quality Content and Smarter Media</h3>
                          <p className="text-body-b4 font-regular">
                            a trusted provider of integrated technology, data communication, and connectivity solutions that help businesses navigate the demands of digital transformation.
                          </p>
                        </div>
                        <div className="bizHero__cta mt-auto">
                          <a className="btn btn-lg btn-secondary-outline-reverse" href="#">
                            <span>Learn More</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Maps Section */}
      <section id="coverage-section" className="lnSection lnSection__coverage">
        <div className="container">
          <div className="lnSection--head">
            <div className="lnIntro">
              <div className="lnIntro__content">
                <div className="lnIntro__label text-caption-c1 font-bold">OPERATIONAL AREA</div>
                <div className="lnIntro__title text-headline-h2 font-bold">
                  Linknet continues to expand its reach to serve more cities in Indonesia
                </div>
                <div className="lnIntro__desc text-body-b4 font-regular">
                  Please click on one of the provinces
                </div>
              </div>
            </div>
          </div>

          <div id="coverage-container" className="coverage-container">
            <div className="map-scroll">
              <div id="indo-map">
                <div className="map-hint">Klik salah satu provinsi pada peta</div>
              </div>
            </div>

            <aside id="coverage-widget" className="card" aria-hidden="true">
              <div className="widget-head">
                <h3 className="text-body-b4 font-bold">Detail Coverage</h3>
                <button id="coverage-close" className="widget-close" aria-label="Close">
                  <img src="/assets_frontend/assets/icons/close.svg" width="24" height="24" alt="Close" />
                </button>
              </div>
              <p id="coverage-hint" className="muted">Klik provinsi pada peta untuk melihat detail.</p>
              <div id="coverage-detail" style={{ marginTop: '8px' }}></div>
            </aside>
          </div>
        </div>

        {/* JSON Data */}
        <script type="application/json" id="business_units" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "BU1": { "label": "Area", "title": "Sumatera", "cities": ["Medan", "Batam", "Palembang"] },
            "BU2": { "label": "Area", "title": "Jakarta", "cities": ["Jabo 1", "Jabo 2", "Jabo 3"] },
            "BU3": { "label": "Area", "title": "West Java", "cities": ["Bandung", "Cirebon", "Cikampek"] },
            "BU4": { "label": "Area", "title": "Central Java", "cities": ["Semarang", "Yogyakarta", "Solo"] },
            "BU5": { "label": "Area", "title": "East Java & Bali", "cities": ["Surabaya", "Gresik", "Sidoarjo"] }
          })
        }} />
        
        <script type="application/json" id="province_bu_map" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "id-su": "BU1",
            "id-kr": "BU1",
            "id-sl": "BU1",
            "id-jk": "BU2",
            "id-jr": "BU3",
            "id-jt": "BU4",
            "id-yo": "BU4",
            "id-ji": "BU5",
            "id-ba": "BU5"
          })
        }} />
      </section>

      {/* Reports Section */}
      <section className="lnSection lnSection__reports">
        <div className="container">
          <div className="lnSection--head">
            <div className="lnIntro">
              <div className="lnIntro__content">
                <div className="lnIntro__label text-caption-c1 font-bold">REPORT & ANNOUNCEMENT</div>
                <div className="lnIntro__title text-headline-h2 font-bold">
                  Performance Transparency & Corporate Announcements
                </div>
                <div className="lnIntro__desc text-body-b4 font-regular">
                  Discover our latest reports and explore the results we have delivered to our shareholders
                </div>
              </div>
            </div>
          </div>

          <div className="lnSection--body">
            <div className="lnTabsWrapper">
              <div className="swiper lnTabs" aria-label="Report Tabs">
                <div className="swiper-wrapper">
                  <button className="swiper-slide lnTab is-active" type="button" role="tab" aria-selected={true} data-target="#panel-report">
                    <span className="lnTab__label text-body-b4 font-medium">Report</span>
                  </button>
                  <button className="swiper-slide lnTab" type="button" role="tab" aria-selected={false} data-target="#panel-announcement">
                    <span className="lnTab__label text-body-b4 font-medium">Announcements</span>
                  </button>
                </div>
              </div>

              <div className="lnTabPanel is-active" id="panel-report" role="tabpanel">
                <div className="row g-4">
                  {/* Card 1 */}
                  <div className="col-12 col-md-4">
                    <article className="lnReportCard h-100 d-flex flex-column">
                      <div className="lnReportCard__content">
                        <div className="lnReportCard__text">
                          <h3 className="lnReportCard__title text-headline-h5 font-bold">Annual Reports</h3>
                          <p className="lnReportCard__desc text-body-b5 text-secondary">
                            Temukan perjalanan pertumbuhan, strategi, dan pencapaian kami setiap tahunnya.
                          </p>
                        </div>
                        <div className="lnReportCard__icon">
                          <img src="/assets_frontend/assets/icons/pdf-circlesvg.svg" alt="" width="56" height="56" loading="lazy" />
                        </div>
                      </div>
                      <div className="lnReportCard__actions mt-auto">
                        <a href="#" className="btn btn-md btn-secondary-outline with-icon with-icon-end">
                          <span>View More</span>
                          <img src="/assets_frontend/assets/icons/arrow-top-right.svg" alt="" width="18" height="18" />
                        </a>
                      </div>
                    </article>
                  </div>

                  {/* Card 2 */}
                  <div className="col-12 col-md-4">
                    <article className="lnReportCard h-100 d-flex flex-column">
                      <div className="lnReportCard__content">
                        <div className="lnReportCard__text">
                          <h3 className="lnReportCard__title text-headline-h5 font-bold">Financial Statement</h3>
                          <p className="lnReportCard__desc text-body-b5 text-secondary">
                            Lihat transparansi keuangan kami yang mendorong kepercayaan dan peluang baru.
                          </p>
                        </div>
                        <div className="lnReportCard__icon">
                          <img src="/assets_frontend/assets/icons/pdf-circlesvg.svg" alt="" width="56" height="56" loading="lazy" />
                        </div>
                      </div>
                      <div className="lnReportCard__actions mt-auto">
                        <a href="#" className="btn btn-md btn-secondary-outline with-icon with-icon-end">
                          <span>View More</span>
                          <img src="/assets_frontend/assets/icons/arrow-top-right.svg" alt="" width="18" height="18" />
                        </a>
                      </div>
                    </article>
                  </div>

                  {/* Card 3 */}
                  <div className="col-12 col-md-4">
                    <article className="lnReportCard h-100 d-flex flex-column">
                      <div className="lnReportCard__content">
                        <div className="lnReportCard__text">
                          <h3 className="lnReportCard__title text-headline-h5 font-bold">Sustainable Reports</h3>
                          <p className="lnReportCard__desc text-body-b5 text-secondary">
                            Ikuti komitmen kami membangun masa depan berkelanjutan bagi bisnis dan masyarakat.
                          </p>
                        </div>
                        <div className="lnReportCard__icon">
                          <img src="/assets_frontend/assets/icons/pdf-circlesvg.svg" alt="" width="56" height="56" loading="lazy" />
                        </div>
                      </div>
                      <div className="lnReportCard__actions mt-auto">
                        <a href="#" className="btn btn-md btn-secondary-outline with-icon with-icon-end">
                          <span>View More</span>
                          <img src="/assets_frontend/assets/icons/arrow-top-right.svg" alt="" width="18" height="18" />
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <div className="lnTabPanel" id="panel-announcement" role="tabpanel">
                <div className="row g-4">
                  {/* Same cards structure for announcements */}
                  <div className="col-12 col-md-4">
                    <article className="lnReportCard h-100 d-flex flex-column">
                      <div className="lnReportCard__content">
                        <div className="lnReportCard__text">
                          <h3 className="lnReportCard__title text-headline-h5 font-bold">GMS Announcement</h3>
                          <p className="lnReportCard__desc text-body-b5 text-secondary">
                            Pengumuman Rapat Umum Pemegang Saham terbaru.
                          </p>
                        </div>
                        <div className="lnReportCard__icon">
                          <img src="/assets_frontend/assets/icons/pdf-circlesvg.svg" alt="" width="56" height="56" loading="lazy" />
                        </div>
                      </div>
                      <div className="lnReportCard__actions mt-auto">
                        <a href="#" className="btn btn-md btn-secondary-outline with-icon with-icon-end">
                          <span>View More</span>
                          <img src="/assets_frontend/assets/icons/arrow-top-right.svg" alt="" width="18" height="18" />
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media & Activities Section */}
      <section className="bg-gradient-gray">
        <div className="container py-5">
          <div className="row">
            <div className="col-md-12">
              <div className="lnIntro">
                <div className="lnIntro__content">
                  <div className="lnIntro__label text-caption-c1 font-bold">MEDIA & ACTIVITIES</div>
                  <div className="lnIntro__title text-headline-h2 font-bold">
                    Keep up with what&apos;s happening at Linknet
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Main */}
            <div className="col-md-12 mb-5">
              <div className="card featured-main">
                <div className="row">
                  <div className="col-lg-7 pr-lg-0">
                    <img src="/assets_frontend/assets/img/main-image-7.jpg" className="thumbnail" alt="" />
                  </div>
                  <div className="col-lg-5 my-auto px-lg-0">
                    <div className="card-body">
                      <div className="card-title mb-4">
                        <div className="d-flex align-items-center gap-3">
                          <span className="text-body-b5 text-warning font-bold">PRESS RELEASE</span>
                          <div className="point"></div>
                          <span className="text-body-b5 text-secondary font-regular">May 22, 2025</span>
                        </div>
                        <h3 className="text-headline-h4 text-black font-bold">
                          Linknet dan Nexa Teken Nota Kesepahaman Kerja Sama Infrastruktur Jaringan ICT
                        </h3>
                        <p className="text-body-b4 text-secondary font-regular">
                          PT Link Net Tbk (&quot;Linknet&quot;, Kode Emiten: LINK) dan PT Internet Mulia Untuk Negeri (NEXA) resmi menandatangani Nota Kesepahaman tentang Kerja Sama Strategis dalam Penyediaan Solusi Infrastruktur Information, Communication & Technology (ICT)
                        </p>
                      </div>
                      <a href="#" className="btn btn-lg btn-secondary-outline text-body-b4 font-medium w-auto">
                        Read the Press Release
                        <img src="/assets_frontend/assets/icons/arrow-top-right.svg" alt="" className="d-none d-sm-block" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Cards */}
            <div className="col-12">
              <div className="row">
                <div className="col-sm-12 col-md-6 col-lg-4">
                  <a href="#" className="card card-featured d-flex flex-column mb-4">
                    <img src="/assets_frontend/assets/img/main-image-8.jpg" className="thumbnail" alt="" />
                    <div className="card-body">
                      <div className="card-title">
                        <span className="text-caption-c1 text-warning font-medium">PRESS RELEASE</span>
                        <h3 className="text-body-b3 text-black font-bold">
                          Centratama Group and Linknet to Enhance Broadband Connectivity Across Indonesia
                        </h3>
                      </div>
                      <span className="text-body-b5 text-secondary font-regular">May 22, 2025</span>
                    </div>
                  </a>
                </div>

                <div className="col-sm-12 col-md-6 col-lg-4">
                  <a href="#" className="card card-featured d-flex flex-column mb-4">
                    <img src="/assets_frontend/assets/img/main-image-10.jpg" className="thumbnail" alt="" />
                    <div className="card-body">
                      <div className="card-title">
                        <span className="text-caption-c1 text-warning font-medium">PRESS RELEASE</span>
                        <h3 className="text-body-b3 text-black font-bold">
                          PT Link Net Tbk Rayakan Ulang Tahun ke-25 dengan Berbagi Kebahagiaan di Bulan Ramadan
                        </h3>
                      </div>
                      <span className="text-body-b5 text-secondary font-regular">May 22, 2025</span>
                    </div>
                  </a>
                </div>

                <div className="col-sm-12 col-md-6 col-lg-4">
                  <a href="#" className="card card-featured d-flex flex-column mb-4">
                    <img src="/assets_frontend/assets/img/main-image-1.jpg" className="thumbnail" alt="" />
                    <div className="card-body">
                      <div className="card-title">
                        <span className="text-caption-c1 text-warning font-medium">PRESS RELEASE</span>
                        <h3 className="text-body-b3 text-black font-bold">
                          Citranet Partners with Linknet to Expand Network Coverage in Yogyakarta and Banyumas
                        </h3>
                      </div>
                      <span className="text-body-b5 text-secondary font-regular">May 22, 2025</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
