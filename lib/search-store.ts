import { create } from 'zustand'

interface SearchState {
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))