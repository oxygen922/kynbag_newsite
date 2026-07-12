import { useFilterStore } from '@/store/useFilterStore';
import type { BrandSubcategories } from '@/types';

interface SubcategoryFilterProps {
  subcategories: BrandSubcategories;
}

export default function SubcategoryFilter({ subcategories }: SubcategoryFilterProps) {
  const { selectedSubcategories, toggleSubcategory } = useFilterStore();

  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-widest text-champagne mb-3 font-medium">
        {subcategories.name} Styles
      </h3>
      <div className="flex flex-wrap gap-2">
        {subcategories.subcategories.map((subcat) => {
          const isSelected = selectedSubcategories.includes(subcat.id);
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
  );
}