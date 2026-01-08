/**
 * Next.js Compatible Admin Script
 * Lightweight version without jQuery dependencies
 * Fixes: TypeError - Cannot set properties of null (setting 'checked')
 */

(function() {
  'use strict';

  // Safe DOM element checker
  function safeGetElement(id) {
    try {
      return document.getElementById(id);
    } catch (e) {
      return null;
    }
  }

  // Safe property setter
  function safeSetChecked(elementId) {
    const element = safeGetElement(elementId);
    if (element && typeof element.checked !== 'undefined') {
      element.checked = true;
    }
  }

  // Initialize MetisMenu for sidebar (if jQuery is loaded)
  function initMetisMenu() {
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.metisMenu !== 'undefined') {
      try {
        jQuery('#side-menu').metisMenu();
      } catch (e) {
        console.warn('MetisMenu initialization skipped:', e.message);
      }
    }
  }

  // Sidebar toggle functionality
  function initSidebarToggle() {
    const toggleBtn = safeGetElement('vertical-menu-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.classList.toggle('sidebar-enable');

      const currentSize = document.body.getAttribute('data-sidebar-size');
      if (window.innerWidth >= 992) {
        if (!currentSize || currentSize === 'lg') {
          document.body.setAttribute('data-sidebar-size', 'sm');
        } else {
          document.body.setAttribute('data-sidebar-size', 'lg');
        }
      }
    });
  }

  // Active menu highlighting (Next.js compatible)
  function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('#sidebar-menu a');

    menuLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href) && href !== '/') {
        link.classList.add('active');
        
        // Add active class to parent elements
        let parent = link.parentElement;
        while (parent) {
          if (parent.classList.contains('mm-collapse')) {
            parent.classList.add('mm-show');
          }
          if (parent.tagName === 'LI') {
            parent.classList.add('mm-active');
          }
          parent = parent.parentElement;
          if (parent && parent.id === 'sidebar-menu') break;
        }
      }
    });
  }

  // Fullscreen toggle
  function initFullscreenToggle() {
    const fullscreenToggles = document.querySelectorAll('[data-toggle="fullscreen"]');
    
    fullscreenToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!document.fullscreenElement && !document.mozFullScreenElement && 
            !document.webkitFullscreenElement) {
          // Enter fullscreen
          const docElm = document.documentElement;
          if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
          } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
          } else if (docElm.webkitRequestFullscreen) {
            docElm.webkitRequestFullscreen();
          }
          document.body.classList.add('fullscreen-enable');
        } else {
          // Exit fullscreen
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
          document.body.classList.remove('fullscreen-enable');
        }
      });
    });

    // Listen for fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  }

  function handleFullscreenChange() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && 
        !document.webkitFullscreenElement) {
      document.body.classList.remove('fullscreen-enable');
    }
  }

  // Bootstrap tooltips and popovers (if Bootstrap is loaded)
  function initBootstrapComponents() {
    if (typeof bootstrap !== 'undefined') {
      // Initialize tooltips
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(function(tooltipTriggerEl) {
        try {
          new bootstrap.Tooltip(tooltipTriggerEl);
        } catch (e) {
          console.warn('Tooltip initialization failed:', e.message);
        }
      });

      // Initialize popovers
      const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
      popoverTriggerList.forEach(function(popoverTriggerEl) {
        try {
          new bootstrap.Popover(popoverTriggerEl);
        } catch (e) {
          console.warn('Popover initialization failed:', e.message);
        }
      });
    }
  }

  // Dark mode toggle
  function initDarkModeToggle() {
    const modeToggle = safeGetElement('mode-setting-btn');
    if (!modeToggle) return;

    modeToggle.addEventListener('click', function() {
      const currentTheme = document.body.getAttribute('data-bs-theme');
      
      if (currentTheme === 'dark') {
        // Switch to light mode
        document.body.setAttribute('data-bs-theme', 'light');
        document.body.setAttribute('data-topbar', 'light');
        document.body.setAttribute('data-sidebar', 'light');
        safeSetChecked('layout-mode-light');
        safeSetChecked('topbar-color-light');
        safeSetChecked('sidebar-color-light');
      } else {
        // Switch to dark mode
        document.body.setAttribute('data-bs-theme', 'dark');
        document.body.setAttribute('data-topbar', 'dark');
        document.body.setAttribute('data-sidebar', 'dark');
        safeSetChecked('layout-mode-dark');
        safeSetChecked('topbar-color-dark');
        safeSetChecked('sidebar-color-dark');
      }
    });
  }

  // Initialize layout settings (with null checks)
  function initLayoutSettings() {
    const body = document.body;
    
    // Layout type
    if (body.hasAttribute('data-layout')) {
      const layout = body.getAttribute('data-layout');
      if (layout === 'horizontal') {
        safeSetChecked('layout-horizontal');
      } else {
        safeSetChecked('layout-vertical');
      }
    }

    // Theme mode
    const theme = body.getAttribute('data-bs-theme');
    if (theme === 'dark') {
      safeSetChecked('layout-mode-dark');
    } else {
      safeSetChecked('layout-mode-light');
    }

    // Sidebar size
    const sidebarSize = body.getAttribute('data-sidebar-size');
    if (sidebarSize === 'sm') {
      safeSetChecked('sidebar-size-small');
    } else if (sidebarSize === 'md') {
      safeSetChecked('sidebar-size-compact');
    } else {
      safeSetChecked('sidebar-size-default');
    }

    // Topbar color
    const topbarColor = body.getAttribute('data-topbar');
    if (topbarColor === 'dark') {
      safeSetChecked('topbar-color-dark');
    } else {
      safeSetChecked('topbar-color-light');
    }

    // Sidebar color
    const sidebarColor = body.getAttribute('data-sidebar');
    if (sidebarColor === 'dark') {
      safeSetChecked('sidebar-color-dark');
    } else if (sidebarColor === 'brand') {
      safeSetChecked('sidebar-color-brand');
    } else {
      safeSetChecked('sidebar-color-light');
    }
  }

  // Right sidebar toggle
  function initRightSidebar() {
    const rightBarToggles = document.querySelectorAll('.right-bar-toggle');
    
    rightBarToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        document.body.classList.toggle('right-bar-enabled');
      });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      const target = e.target;
      const isToggle = target.closest('.right-bar-toggle');
      const isRightBar = target.closest('.right-bar');
      
      if (!isToggle && !isRightBar) {
        document.body.classList.remove('right-bar-enabled');
      }
    });
  }

  // Counter animation (if needed)
  function initCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-value');
    
    counterElements.forEach(function(counter) {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      const duration = 1000;
      const step = target / (duration / 16);
      let current = 0;

      const updateCounter = function() {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      // Start animation when element is in viewport
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            updateCounter();
            observer.disconnect();
          }
        });
      });

      observer.observe(counter);
    });
  }

  // Feather icons replacement (if available)
  function initFeatherIcons() {
    if (typeof feather !== 'undefined' && typeof feather.replace === 'function') {
      try {
        feather.replace();
      } catch (e) {
        console.warn('Feather icons initialization skipped:', e.message);
      }
    }
  }

  // Main initialization
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize components
    try {
      initMetisMenu();
      initSidebarToggle();
      highlightActiveMenu();
      initFullscreenToggle();
      initBootstrapComponents();
      initDarkModeToggle();
      initLayoutSettings();
      initRightSidebar();
      initCounterAnimation();
      initFeatherIcons();
    } catch (e) {
      console.error('Admin script initialization error:', e);
    }
  }

  // Start initialization
  init();

  // Re-initialize on Next.js navigation
  if (typeof window !== 'undefined') {
    // Listen for Next.js route changes
    window.addEventListener('popstate', function() {
      setTimeout(function() {
        highlightActiveMenu();
        initBootstrapComponents();
        initFeatherIcons();
      }, 100);
    });
  }

})();
