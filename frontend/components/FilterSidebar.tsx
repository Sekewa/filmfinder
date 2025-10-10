import React from 'react';
import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { genres, countries } from "../data/mockData";

interface FilterSidebarProps {
  filters: {
    genres: string[];
    yearRange: [number, number];
    durationRange: [number, number];
    minRating: number;
    countries: string[];
  };
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterSidebar({ filters, onFiltersChange, isOpen, onToggle }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    genres: true,
    year: true,
    duration: true,
    rating: true,
    countries: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const updateGenres = (genre: string, checked: boolean) => {
    const newGenres = checked 
      ? [...filters.genres, genre]
      : filters.genres.filter(g => g !== genre);
    
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const updateCountries = (country: string, checked: boolean) => {
    const newCountries = checked 
      ? [...filters.countries, country]
      : filters.countries.filter(c => c !== country);
    
    onFiltersChange({ ...filters, countries: newCountries });
  };

  const clearFilters = () => {
    onFiltersChange({
      genres: [],
      yearRange: [1990, 2024],
      durationRange: [60, 240],
      minRating: 0,
      countries: []
    });
  };

  const FilterSection = ({ title, section, children }: { title: string; section: string; children: React.ReactNode }) => (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-2 text-left hover:text-primary transition-colors"
      >
        <span className="font-medium">{title}</span>
        {expandedSections[section as keyof typeof expandedSections] ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
        }
      </button>
      <AnimatePresence>
        {expandedSections[section as keyof typeof expandedSections] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full justify-center rounded-2xl"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={onToggle}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-80 h-full bg-card border-r border-border overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filtres</h2>
                  <Button variant="ghost" size="sm" onClick={onToggle}>
                    ×
                  </Button>
                </div>
                <FilterContent />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function FilterContent() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold hidden lg:block">Filtres</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Button>
        </div>

        <div className="space-y-6">
          {/* Genres */}
          <FilterSection title="Genres" section="genres">
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {genres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={filters.genres.includes(genre)}
                    onCheckedChange={(checked) => updateGenres(genre, checked as boolean)}
                  />
                  <label htmlFor={genre} className="text-sm cursor-pointer">
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Année */}
          <FilterSection title="Année de sortie" section="year">
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={filters.yearRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, yearRange: value as [number, number] })}
                  max={2024}
                  min={1990}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.yearRange[0]}</span>
                <span>{filters.yearRange[1]}</span>
              </div>
            </div>
          </FilterSection>

          {/* Durée */}
          <FilterSection title="Durée (minutes)" section="duration">
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={filters.durationRange}
                  onValueChange={(value) => onFiltersChange({ ...filters, durationRange: value as [number, number] })}
                  max={240}
                  min={60}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{filters.durationRange[0]} min</span>
                <span>{filters.durationRange[1]} min</span>
              </div>
            </div>
          </FilterSection>

          {/* Note minimale */}
          <FilterSection title="Note minimale" section="rating">
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={[filters.minRating]}
                  onValueChange={(value) => onFiltersChange({ ...filters, minRating: value[0] })}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                ⭐ {filters.minRating.toFixed(1)}+
              </div>
            </div>
          </FilterSection>

          {/* Pays */}
          <FilterSection title="Pays" section="countries">
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {countries.map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={country}
                    checked={filters.countries.includes(country)}
                    onCheckedChange={(checked) => updateCountries(country, checked as boolean)}
                  />
                  <label htmlFor={country} className="text-sm cursor-pointer">
                    {country}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    );
  }
}