/**
 * Stock Market Widget
 * Handles real-time stock data display and auto-refresh functionality
 */
class StockMarketWidget {
    constructor(options = {}) {
        this.config = {
            refreshInterval: options.refreshInterval || 300000, // 5 minutes
            apiEndpoint: options.apiEndpoint || '/api/stock/current',
            refreshEndpoint: options.refreshEndpoint || '/api/stock/refresh',
            containerSelector: options.containerSelector || '.stock-widget',
            enableAutoRefresh: options.enableAutoRefresh !== false,
            ...options
        };

        this.containers = document.querySelectorAll(this.config.containerSelector);
        this.refreshTimer = null;
        this.isLoading = false;
        this.lastUpdateTime = null;

        this.init();
    }

    init() {
        if (this.containers.length === 0) {
            console.warn('Stock Market Widget: No containers found');
            return;
        }

        // Initial load
        this.loadStockData();

        // Setup auto-refresh
        if (this.config.enableAutoRefresh) {
            this.startAutoRefresh();
        }

        // Setup manual refresh buttons
        this.setupRefreshButtons();

        // Handle page visibility changes
        this.handleVisibilityChange();
    }

    async loadStockData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.updateLoadingState(true);

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                this.updateStockDisplay(result.data);
                this.lastUpdateTime = new Date();
                console.log('Stock data updated:', result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch stock data');
            }
        } catch (error) {
            console.error('Error loading stock data:', error);
            this.handleError(error);
        } finally {
            this.isLoading = false;
            this.updateLoadingState(false);
        }
    }

    updateStockDisplay(stockData) {
        this.containers.forEach(container => {
            // Update symbol
            const symbolElement = container.querySelector('[data-stock="symbol"]');
            if (symbolElement) {
                symbolElement.textContent = `IDX:${stockData.symbol.replace('.JK', '')}`;
            }

            // Update price
            const priceElement = container.querySelector('[data-stock="price"]');
            if (priceElement) {
                priceElement.textContent = stockData.formatted_price;

                // Add animation effect
                // priceElement.classList.add('stock-updated');
                // setTimeout(() => priceElement.classList.remove('stock-updated'), 1000);
            }

            // Update change indicator
            const changeElement = container.querySelector('[data-stock="change"]');
            if (changeElement && stockData.change !== 0) {
                const changeText = `${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.change_percent.toFixed(2)}%)`;
                changeElement.textContent = changeText;
                changeElement.className = `stock-change stock-${stockData.change_direction}`;
            }

            // Update last updated time
            const lastUpdatedElement = container.querySelector('[data-stock="last-updated"]');
            if (lastUpdatedElement) {
                lastUpdatedElement.setAttribute('data-bs-title', `Last updated at ${stockData.formatted_last_updated}`);

                // Reinitialize tooltip if Bootstrap is available
                if (typeof bootstrap !== 'undefined') {
                    const tooltip = bootstrap.Tooltip.getInstance(lastUpdatedElement);
                    if (tooltip) {
                        tooltip.dispose();
                    }
                    new bootstrap.Tooltip(lastUpdatedElement);
                }
            }

            // Update market status
            const statusElement = container.querySelector('[data-stock="status"]');
            if (statusElement) {
                statusElement.className = `stock-status stock-status-${stockData.is_market_open ? 'open' : 'closed'}`;
                statusElement.textContent = stockData.is_market_open ? 'Market Open' : 'Market Closed';
            }

            // Update data status indicator
            const dataStatusElement = container.querySelector('[data-stock="data-status"]');
            if (dataStatusElement) {
                dataStatusElement.className = `stock-data-status stock-data-${stockData.status}`;
                dataStatusElement.title = stockData.status === 'live' ? 'Live data' : 'Cached data';
            }
        });
    }

    updateLoadingState(isLoading) {
        this.containers.forEach(container => {
            const loadingIndicator = container.querySelector('[data-stock="loading"]');
            if (loadingIndicator) {
                // loadingIndicator.style.display = isLoading ? 'inline-block' : 'none';
                loadingIndicator.style.display = isLoading ? 'none' : 'none';
            }

            // Disable refresh buttons during loading
            const refreshButtons = container.querySelectorAll('[data-stock="refresh-btn"]');
            refreshButtons.forEach(btn => {
                btn.disabled = isLoading;
                if (isLoading) {
                    btn.classList.add('loading');
                } else {
                    btn.classList.remove('loading');
                }
            });
        });
    }

    handleError(error) {
        console.error('Stock widget error:', error);

        // Show error state in UI
        this.containers.forEach(container => {
            const errorElement = container.querySelector('[data-stock="error"]');
            if (errorElement) {
                errorElement.textContent = 'Unable to update stock data';
                errorElement.style.display = 'block';

                // Hide error after 5 seconds
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 5000);
            }
        });
    }

    setupRefreshButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-stock="refresh-btn"]') || e.target.closest('[data-stock="refresh-btn"]')) {
                e.preventDefault();
                this.manualRefresh();
            }
        });
    }

    async manualRefresh() {
        try {
            const response = await fetch(this.config.refreshEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                this.updateStockDisplay(result.data);
                this.showSuccessMessage('Stock data refreshed successfully');
            } else {
                throw new Error(result.message || 'Failed to refresh stock data');
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    showSuccessMessage(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'stock-notification stock-success';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.style.opacity = '1', 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing timer

        this.refreshTimer = setInterval(() => {
            if (!document.hidden) { // Only refresh if page is visible
                this.loadStockData();
            }
        }, this.config.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                // Refresh data when page becomes visible again
                this.loadStockData();
                if (this.config.enableAutoRefresh) {
                    this.startAutoRefresh();
                }
            }
        });
    }

    destroy() {
        this.stopAutoRefresh();
        // Remove event listeners and cleanup
        this.containers = [];
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize stock widget with default settings
    window.stockWidget = new StockMarketWidget({
        refreshInterval: 300000, // 5 minutes
        enableAutoRefresh: true
    });
});

// Export for manual initialization if needed
window.StockMarketWidget = StockMarketWidget;
