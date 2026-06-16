// 搜索状态：弹窗开关 + 搜索词
import { create } from 'zustand';

interface SearchState {
  isOpen: boolean;
  query: string;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  setOpen: (isOpen) => set({ isOpen }),
  setQuery: (query) => set({ query }),
}));
