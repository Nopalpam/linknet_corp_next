import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any; // Allow additional filters
}

/**
 * Paginated API response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Fetch function type for CRUD operations
 */
export type FetchFunction<T> = (params: PaginationParams) => Promise<PaginatedResponse<T>>;

/**
 * Configuration for useCrudTable hook
 */
export interface UseCrudTableConfig<T> {
  fetchFunction: FetchFunction<T>;
  initialLimit?: number;
  debounceDelay?: number;
}

/**
 * Custom hook for managing CRUD table with server-side pagination, search, and sorting
 * 
 * @param config - Configuration object
 * @returns Table state and methods
 * 
 * @example
 * const { 
 *   data, 
 *   loading, 
 *   pagination,
 *   handlePageChange,
 *   handleSearch,
 *   refetch 
 * } = useCrudTable({
 *   fetchFunction: awardsService.getPaginated
 * });
 */
export function useCrudTable<T>({
  fetchFunction,
  initialLimit = 10,
  debounceDelay = 500,
}: UseCrudTableConfig<T>) {
  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  
  // Search & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Additional filters
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, debounceDelay);

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: PaginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(sortBy && { sortBy, sortOrder }),
        ...filters,
      };

      const response = await fetchFunction(params);

      setData(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setItemsPerPage(response.pagination.itemsPerPage);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, sortBy, sortOrder, filters, fetchFunction]);

  /**
   * Fetch data on mount and when dependencies change
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handle search input change
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  /**
   * Handle sort change
   */
  const handleSort = useCallback((column: string) => {
    setSortBy((prev) => {
      if (prev === column) {
        // Toggle sort order if same column
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
      } else {
        // Default to ascending for new column
        setSortOrder('asc');
      }
      return column;
    });
  }, []);

  /**
   * Handle limit change (items per page)
   */
  const handleLimitChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  }, []);

  /**
   * Refetch data (useful after create/update/delete)
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Reset all filters and go back to page 1
   */
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy(undefined);
    setSortOrder('asc');
    setFilters({});
    setCurrentPage(1);
  }, []);

  return {
    // Data
    data,
    loading,
    error,
    
    // Pagination
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    },
    
    // Search & Sort
    searchQuery,
    sortBy,
    sortOrder,
    filters,
    
    // Methods
    handlePageChange,
    handleSearch,
    handleSort,
    handleLimitChange,
    updateFilters,
    refetch,
    resetFilters,
  };
}
