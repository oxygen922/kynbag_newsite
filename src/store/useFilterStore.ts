// 筛选状态：品牌、品类、子分类、排序
import { create } from 'zustand';

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

interface FilterState {
  selectedBrands: string[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  sortBy: SortOption;
  page: number;
  pageSize: number;
  setBrands: (brands: string[]) => void;
  toggleBrand: (brand: string) => void;
  setCategories: (cats: string[]) => void;
  toggleCategory: (cat: string) => void;
  setSubcategories: (subcats: string[]) => void;
  toggleSubcategory: (subcat: string) => void;
  setSortBy: (sort: SortOption) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedBrands: [],
  selectedCategories: [],
  selectedSubcategories: [],
  sortBy: 'newest',
  page: 1,
  pageSize: 24,
  setBrands: (brands) => set({ selectedBrands: brands, page: 1 }),
  toggleBrand: (brand) =>
    set((state) => {
      const exists = state.selectedBrands.includes(brand);
      return {
        selectedBrands: exists
          ? state.selectedBrands.filter((b) => b !== brand)
          : [...state.selectedBrands, brand],
        selectedSubcategories: [], // 切换品牌时清空子分类
        page: 1,
      };
    }),
  setCategories: (cats) => set({ selectedCategories: cats, page: 1 }),
  toggleCategory: (cat) =>
    set((state) => {
      const exists = state.selectedCategories.includes(cat);
      return {
        selectedCategories: exists
          ? state.selectedCategories.filter((c) => c !== cat)
          : [...state.selectedCategories, cat],
        page: 1,
      };
    }),
  setSubcategories: (subcats) => set({ selectedSubcategories: subcats, page: 1 }),
  toggleSubcategory: (subcat) =>
    set((state) => {
      const exists = state.selectedSubcategories.includes(subcat);
      return {
        selectedSubcategories: exists
          ? state.selectedSubcategories.filter((s) => s !== subcat)
          : [...state.selectedSubcategories, subcat],
        page: 1,
      };
    }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({ selectedBrands: [], selectedCategories: [], selectedSubcategories: [], sortBy: 'newest', page: 1 }),
}));
