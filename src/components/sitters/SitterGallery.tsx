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
        
        {/* Mobile: Grid Layout (First 4 items) */}
        <div className="relative md:hidden">
            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                {photos.slice(0, 4).map((photo, index) => (
                    <div 
                        key={photo.id} 
                        className={`relative aspect-[4/3] bg-gray-100 ${index === 0 && photos.length % 2 !== 0 ? 'col-span-2 aspect-[16/9]' : ''}`}
                        onClick={() => setShowGridModal(true)}
                    >
                        <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                         {/* Overlay on the last visible item if there are more photos */}
                        {index === 3 && photos.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium text-lg">
                                +{photos.length - 4}
                            </div>
                        )}
                        {/* Overlay on the last item if it's the 4th item but total is exactly 4, or generally just make the whole thing clickable to open grid/lightbox */}
                    </div>
                ))}
            </div>
            
            {/* View All Button (Floating) */}
            <div className="absolute bottom-4 right-4 pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-auto cursor-pointer" onClick={() => setShowGridModal(true)}>
                    <FaImages className="w-3.5 h-3.5" />
                    <span>{photos.length} photos</span>
                </div>
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



                     {/* Dot Navigation (Mobile) */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 md:hidden z-30">
                        {photos.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === lightboxIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
