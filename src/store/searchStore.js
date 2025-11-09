import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { searchProducts } from '../services/api';

export const useSearchStore = create(
  persist(
    (set, get) => ({
      // State
      searchQuery: '',
      searchResults: [],
      recentSearches: [],
      isSearching: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        perPage: 12
      },
      filters: {
        brand_id: '',
        min_price: '',
        max_price: '',
        gender: '',
        sort_by: '',
        sort_order: 'desc'
      },

      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      clearFilters: () => set({
        filters: {
          brand_id: '',
          min_price: '',
          max_price: '',
          gender: '',
          sort_by: '',
          sort_order: 'desc'
        }
      }),

      // Perform search
      performSearch: async (query, page = 1) => {
        const state = get();
        
        if (!query || !query.trim()) {
          set({ 
            searchResults: [], 
            error: 'Vui lòng nhập từ khóa tìm kiếm' 
          });
          return;
        }

        set({ isSearching: true, error: null });

        try {
          const params = {
            keyword: query.trim(),
            page: page,
            limit: state.pagination.perPage,
            ...state.filters
          };

          // Remove empty filters
          Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key];
          });

          const response = await searchProducts(params);

          set({
            searchResults: response.data || [],
            pagination: {
              currentPage: response.current_page || 1,
              totalPages: response.last_page || 1,
              totalResults: response.total || 0,
              perPage: response.per_page || 12
            },
            isSearching: false,
            error: null
          });

          // Add to recent searches
          get().addRecentSearch(query.trim());

        } catch (error) {
          console.error('Search error:', error);
          set({
            searchResults: [],
            isSearching: false,
            error: 'Không thể tìm kiếm. Vui lòng thử lại.'
          });
        }
      },

      // Quick search for header (limit 5 results)
      quickSearch: async (query) => {
        if (!query || !query.trim() || query.trim().length < 2) {
          return [];
        }

        try {
          const response = await searchProducts({
            keyword: query.trim(),
            limit: 5,
            page: 1
          });

          return response.data || [];
        } catch (error) {
          console.error('Quick search error:', error);
          return [];
        }
      },

      // Change page
      setPage: (page) => {
        const state = get();
        set({ 
          pagination: { ...state.pagination, currentPage: page } 
        });
        // Automatically perform search with new page
        get().performSearch(state.searchQuery, page);
      },

      // Add to recent searches
      addRecentSearch: (query) => {
        const state = get();
        const searches = state.recentSearches.filter(s => s !== query);
        searches.unshift(query);
        
        // Keep only last 10 searches
        if (searches.length > 10) {
          searches.pop();
        }

        set({ recentSearches: searches });
      },

      // Clear recent searches
      clearRecentSearches: () => set({ recentSearches: [] }),

      // Remove one recent search
      removeRecentSearch: (query) => set((state) => ({
        recentSearches: state.recentSearches.filter(s => s !== query)
      })),

      // Clear search
      clearSearch: () => set({
        searchQuery: '',
        searchResults: [],
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          perPage: 12
        }
      }),

      // Reset store
      reset: () => set({
        searchQuery: '',
        searchResults: [],
        recentSearches: [],
        isSearching: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          perPage: 12
        },
        filters: {
          brand_id: '',
          min_price: '',
          max_price: '',
          gender: '',
          sort_by: '',
          sort_order: 'desc'
        }
      })
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({ 
        recentSearches: state.recentSearches // Only persist recent searches
      })
    }
  )
);

