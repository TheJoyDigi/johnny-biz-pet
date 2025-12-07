import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTh, FaImages } from 'react-icons/fa';

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

interface SitterGalleryProps {
  photos: GalleryPhoto[];
  title?: string;
}

export default function SitterGallery({ photos, title }: SitterGalleryProps) {
  const [showGridModal, setShowGridModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // For Swipe Logic in Lightbox
  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % photos.length);
  }, [lightboxIndex, photos.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + photos.length) % photos.length);
  }, [lightboxIndex, photos.length]);

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!lightboxIndex && lightboxIndex !== 0) return;
    const threshold = 50;
    if (info.offset.x < -threshold) {
        showNext();
    } else if (info.offset.x > threshold) {
        showPrev();
    }
  };

  // Prevent background scrolling when modal/lightbox is open
  useEffect(() => {
    if (showGridModal || lightboxIndex !== null) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showGridModal, lightboxIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="space-y-4">
        {title && <h2 className="text-xl font-semibold text-[#333333] mb-4">{title}</h2>}
        
        {/* Mobile: Horizontal Swipeable List (Scroll Snap) */}
        <div className="relative md:hidden group">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 scrollbar-hide">
                {photos.slice(0, 6).map((photo, index) => (
                    <div 
                        key={photo.id} 
                        className="flex-shrink-0 w-[85vw] h-64 relative rounded-xl overflow-hidden snap-center shadow-sm"
                        onClick={() => setLightboxIndex(index)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                            sizes="85vw"
                        />
                    </div>
                ))}
                {photos.length > 5 && (
                    <div className="flex-shrink-0 w-[30vw] h-64 flex items-center justify-center snap-center">
                         <button 
                            onClick={() => setShowGridModal(true)}
                            className="flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#1A9CB0]"
                        >
                            <span className="bg-gray-100 p-4 rounded-full">
                                <FaTh className="w-6 h-6" />
                            </span>
                            <span className="text-sm font-medium">View All</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Simple Indicator for Mobile */}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                {photos.length} photos
            </div>
        </div>

        {/* Desktop: Bento Grid (1 Big, 4 Small) */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[400px] rounded-2xl overflow-hidden relative">
            {photos.slice(0, 5).map((photo, index) => {
                let spanClasses = "";
                if (index === 0) spanClasses = "col-span-2 row-span-2"; // Big Main Image
                else spanClasses = "col-span-1 row-span-1";

                return (
                    <div 
                        key={photo.id} 
                        className={`relative cursor-pointer hover:opacity-95 transition-opacity ${spanClasses}`}
                        onClick={() => setLightboxIndex(index)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                            sizes={index === 0 ? "50vw" : "25vw"}
                        />
                    </div>
                );
            })}
            
            {/* View All Button Overlay */}
            <button 
                onClick={() => setShowGridModal(true)}
                className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
                <FaTh /> Show all photos
            </button>
        </div>

        {/* All Photos Grid Modal */}
        <AnimatePresence>
            {showGridModal && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-white flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <button onClick={() => setShowGridModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <FaChevronLeft />
                        </button>
                        <h3 className="font-bold text-lg">Photo Gallery</h3>
                        <div className="w-8"></div> {/* Spacer for center alignment */}
                    </div>
                    
                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo, index) => (
                                <div 
                                    key={photo.id} 
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                                    onClick={() => setLightboxIndex(index)}
                                >
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300"
                                        sizes="(min-width: 768px) 33vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Lightbox / Slideshow */}
        <AnimatePresence>
            {lightboxIndex !== null && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4 backdrop-blur-md"
                    onClick={() => setLightboxIndex(null)} // Click outside to close
                >
                    <button 
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-4 left-4 text-white p-2 z-10 hover:bg-white/10 rounded-full"
                    >
                        <FaTimes className="text-xl" />
                    </button>

                    <div className="absolute top-4 right-4 text-white text-sm font-medium z-10">
                        {lightboxIndex + 1} / {photos.length}
                    </div>

                    <div 
                        className="relative w-full max-w-5xl h-full flex items-center justify-center" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Prev Button */}
                        <button 
                            className="absolute left-0 text-white p-4 hover:bg-white/10 rounded-full hidden md:block z-20"
                            onClick={showPrev}
                        >
                            <FaChevronLeft size={30} />
                        </button>

                        {/* Image + Swipe Area */}
                        <motion.div
                            key={lightboxIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ ease: "easeOut", duration: 0.2 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.8}
                            onDragEnd={onDragEnd}
                            className="relative w-full h-[80vh] cursor-grab active:cursor-grabbing"
                        >
                             <Image
                                src={photos[lightboxIndex].src}
                                alt={photos[lightboxIndex].alt}
                                fill
                                className="object-contain"
                                priority
                                draggable={false}
                            />
                        </motion.div>

                         {/* Next Button */}
                        <button 
                            className="absolute right-0 text-white p-4 hover:bg-white/10 rounded-full hidden md:block z-20"
                            onClick={showNext}
                        >
                            <FaChevronRight size={30} />
                        </button>
                    </div>

                    {/* Thumbnails Strip (Desktop only) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-2 p-2 bg-black/40 rounded-xl overflow-x-auto max-w-[80vw]">
                         {photos.map((photo, idx) => (
                             <button
                                key={photo.id}
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                                className={`relative w-12 h-12 rounded-md overflow-hidden transition-all ${
                                    idx === lightboxIndex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                                }`}
                             >
                                <Image src={photo.src} alt="thumbnail" fill className="object-cover" />
                             </button>
                         ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
