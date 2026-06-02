import React from 'react';
import { motion } from 'motion/react';
import { Gallery as GalleryType } from '../types';

interface GalleryPageProps {
  categories: string[];
  galleryFilter: string;
  setGalleryFilter: (filter: string) => void;
  filteredGallery: GalleryType[];
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  categories,
  galleryFilter,
  setGalleryFilter,
  filteredGallery
}) => {
  return (
    <div className="max-w-none w-full px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3.5xl font-display font-extrabold text-primary">ঐতিহাসিক ছবি অ্যালবাম (Walk down Memory Lane)</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">বিদ্যালয় প্রতিষ্ঠার পর থেকে আজ পর্যন্ত জমা হওয়া সোনালী স্মৃতির গ্যালারি কালেকশন।</p>
      </div>

      {/* Filters list buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 border-b pb-4 text-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setGalleryFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition duration-200 ${
              galleryFilter === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {cat === 'All' ? 'সব স্মৃতি (All)' : cat}
          </button>
        ))}
      </div>

      {/* Images Grid list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGallery.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 font-mono text-sm">কোন ছবি আপলোড করা নাই।</div>
        ) : (
          filteredGallery.map((item) => (
            <motion.div
              layout
              key={item.galleryId}
              className="bg-white rounded-xl overflow-hidden border border-gray-150 shadow-xs hover:shadow-md transition group"
            >
              <div className="aspect-video relative overflow-hidden bg-gray-50">
                <img
                  src={item.image}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-primary/95 text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-extrabold text-gray-900 text-sm tracking-tight leading-tight group-hover:text-primary transition">{item.title}</h4>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
