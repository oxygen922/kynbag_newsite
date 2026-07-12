import { useState } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import type { BrandSubcategories } from '@/types';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface SubcategoryFilterProps {
  subcategories: BrandSubcategories;
}

export default function SubcategoryFilter({ subcategories }: SubcategoryFilterProps) {
  const { selectedSubcategories, toggleSubcategory } = useFilterStore();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const selectedId = selectedSubcategories[0] || null;
  const selectedName = selectedId
    ? subcategories.subcategories.find((s) => s.id === selectedId)?.name
    : 'All Styles';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-widest text-champagne font-medium">
          {subcategories.name} Styles
        </h3>
        {selectedId && (
          <button
            onClick={() => toggleSubcategory(selectedId)}
            className="hidden sm:flex items-center gap-1 text-xs text-champagne/70 hover:text-champagne transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="hidden sm:block">
        <div className="flex flex-wrap gap-2">
          <button
            key="all"
            onClick={() => selectedId && toggleSubcategory(selectedId)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              !selectedId
                ? 'bg-champagne text-ivory shadow-md'
                : 'bg-whisper text-ink/60 hover:bg-champagne/10 hover:text-ink'
            }`}
          >
            All Styles
          </button>
          {subcategories.subcategories.map((subcat) => {
            const isSelected = selectedId === subcat.id;
            return (
              <button
                key={subcat.id}
                onClick={() => toggleSubcategory(subcat.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isSelected
                    ? 'bg-champagne text-ivory shadow-md'
                    : 'bg-whisper text-ink/60 hover:bg-champagne/10 hover:text-ink'
                }`}
              >
                {subcat.name}
                <span className={`ml-1 ${isSelected ? 'text-ivory/70' : 'text-ink/30'}`}>
                  ({subcat.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sm:hidden">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-whisper rounded-lg text-sm text-ink/80"
        >
          <span>{selectedName}</span>
          {isMobileExpanded ? (
            <ChevronUp size={16} className="text-ink/40" />
          ) : (
            <ChevronDown size={16} className="text-ink/40" />
          )}
        </button>
        {isMobileExpanded && (
          <div className="mt-2 space-y-1 bg-whisper rounded-lg overflow-hidden">
            <button
              key="all"
              onClick={() => {
                selectedId && toggleSubcategory(selectedId);
                setIsMobileExpanded(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                !selectedId ? 'bg-champagne text-ivory' : 'text-ink/70 hover:bg-champagne/10'
              }`}
            >
              All Styles
            </button>
            {subcategories.subcategories.map((subcat) => {
              const isSelected = selectedId === subcat.id;
              return (
                <button
                  key={subcat.id}
                  onClick={() => {
                    toggleSubcategory(subcat.id);
                    setIsMobileExpanded(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-champagne text-ivory' : 'text-ink/70 hover:bg-champagne/10'
                  }`}
                >
                  <span>{subcat.name}</span>
                  <span className={`text-xs ${isSelected ? 'text-ivory/70' : 'text-ink/30'}`}>
                    ({subcat.count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}