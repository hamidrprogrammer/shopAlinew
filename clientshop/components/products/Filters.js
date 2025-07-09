'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox'; // Assuming you have this or will create it
import { motion, AnimatePresence } from 'framer-motion';

// Mock data, replace with props or fetched data
const mockColors = [
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'blue', name: 'Blue', hex: '#0000FF' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
];

const mockMaterials = [
  { id: 'wood', name: 'Wood' },
  { id: 'metal', name: 'Metal' },
  { id: 'fabric', name: 'Fabric' },
  { id: 'leather', name: 'Leather' },
  { id: 'velvet', name: 'Velvet' },
];

const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4 border-b border-light-border dark:border-dark-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left"
        aria-expanded={isOpen}
      >
        <h4 className="text-md font-semibold text-light-text dark:text-dark-text">{title}</h4>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: 'auto', marginTop: '12px' },
              collapsed: { opacity: 0, height: 0, marginTop: '0px' },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const Filters = ({
  categories,
  currentCategorySlug,
  onCategoryChange, // (categorySlug) => void
  onPriceChange,    // ({min, max}) => void
  onColorChange,    // (selectedColors) => void
  onMaterialChange, // (selectedMaterials) => void
  // Add more filter change handlers as needed
  className
}) => {
  const t = useTranslations('Filters');
  const tCommon = useTranslations('Common');

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const handleApplyPriceRange = () => {
    onPriceChange({ min: minPrice || undefined, max: maxPrice || undefined });
  };

  const handleColorToggle = (colorId) => {
    const newSelectedColors = selectedColors.includes(colorId)
      ? selectedColors.filter(c => c !== colorId)
      : [...selectedColors, colorId];
    setSelectedColors(newSelectedColors);
    onColorChange(newSelectedColors);
  };

  const handleMaterialToggle = (materialId) => {
    const newSelectedMaterials = selectedMaterials.includes(materialId)
      ? selectedMaterials.filter(m => m !== materialId)
      : [...selectedMaterials, materialId];
    setSelectedMaterials(newSelectedMaterials);
    onMaterialChange(newSelectedMaterials);
  };


  return (
    <aside className={`w-full lg:w-1/4 xl:w-1/5 space-y-0 ${className}`}>
      <div className="p-4 rounded-lg bg-light-secondary dark:bg-dark-secondary shadow-md">
        <h3 className="text-xl font-semibold mb-4 border-b border-light-border dark:border-dark-border pb-3 text-light-text dark:text-dark-text">
          {t('title')}
        </h3>

        <FilterSection title={t('categories.title')} defaultOpen={true}>
          <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {categories?.map(cat => (
              <li key={cat.id || cat.slug}>
                <button
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors
                    ${currentCategorySlug === cat.slug || (!currentCategorySlug && cat.slug === 'all')
                      ? 'bg-light-primary dark:bg-dark-primary text-dark-text dark:text-light-text font-semibold'
                      : 'hover:bg-light-background dark:hover:bg-dark-background text-light-text-secondary dark:text-dark-text-secondary'}`}
                >
                  {cat.name} {/* TODO: Translate category name if dynamic */}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title={t('price.title')}>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Input
              type="number"
              placeholder={t('price.minPlaceholder')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full"
              aria-label={t('price.minPlaceholder')}
            />
            <span className="text-light-text-secondary dark:text-dark-text-secondary">-</span>
            <Input
              type="number"
              placeholder={t('price.maxPlaceholder')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
              aria-label={t('price.maxPlaceholder')}
            />
          </div>
          <Button onClick={handleApplyPriceRange} variant="outline" size="sm" className="w-full mt-3">
            {tCommon('apply')}
          </Button>
        </FilterSection>

        <FilterSection title={t('colors.title')}>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {mockColors.map(color => (
              <Checkbox
                key={color.id}
                id={`color-${color.id}`}
                label={color.name} // TODO: Translate color name
                checked={selectedColors.includes(color.id)}
                onCheckedChange={() => handleColorToggle(color.id)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t('materials.title')}>
           <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {mockMaterials.map(material => (
              <Checkbox
                key={material.id}
                id={`material-${material.id}`}
                label={material.name} // TODO: Translate material name
                checked={selectedMaterials.includes(material.id)}
                onCheckedChange={() => handleMaterialToggle(material.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* TODO: Add Clear All Filters button */}
        {/* <Button variant="ghost" size="sm" className="w-full mt-4 text-light-primary dark:text-dark-primary">
            {tCommon('clearAll')}
        </Button> */}
      </div>
    </aside>
  );
};

export default Filters;
