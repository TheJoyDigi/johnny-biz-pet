import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaArrowLeft, FaArrowRight, FaPaw, FaTimes } from "react-icons/fa";

export type Photo = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

type GalleryVariant = "landing" | "profile";

type PhotoGalleryProps = {
  photos: Photo[];
  title?: string;
  description?: string;
  variant?: GalleryVariant;
};

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, title, description, variant = "landing" }) => {
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>(photos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);
  const [isAutoSlideActive, setIsAutoSlideActive] = useState(true);
  const photosPerPage = 6;
  const autoSlideIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setGalleryPhotos(photos);
    setSelectedPhoto(null);
    setCurrentIndex(0);
    setMobileCurrentIndex(0);
    setDesktopPage(0);
  }, [photos]);

  useEffect(() => {
    if (isAutoSlideActive && galleryPhotos.length > 0) {
      autoSlideIntervalRef.current = setInterval(() => {
        setMobileCurrentIndex((prev) => (prev + 1) % galleryPhotos.length);
        setDesktopPage((prev) => (prev + 1) % Math.ceil(galleryPhotos.length / photosPerPage));
      }, 3000);
    }

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, [isAutoSlideActive, galleryPhotos.length]);

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setIsAutoSlideActive(false);
  };

  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (galleryPhotos.length === 0) return;
    const newIndex = (currentIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    setSelectedPhoto(galleryPhotos[newIndex]);
    setCurrentIndex(newIndex);
    setIsAutoSlideActive(false);
  }, [currentIndex, galleryPhotos]);

  const goToNext = useCallback(() => {
    if (galleryPhotos.length === 0) return;
    const newIndex = (currentIndex + 1) % galleryPhotos.length;
    setSelectedPhoto(galleryPhotos[newIndex]);
    setCurrentIndex(newIndex);
    setIsAutoSlideActive(false);
  }, [currentIndex, galleryPhotos]);

  const goToPreviousMobile = () => {
    if (galleryPhotos.length === 0) return;
    setMobileCurrentIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
    setIsAutoSlideActive(false);
  };

  const goToNextMobile = () => {
    if (galleryPhotos.length === 0) return;
    setMobileCurrentIndex((prev) => (prev + 1) % galleryPhotos.length);
    setIsAutoSlideActive(false);
  };

  const goToPreviousPage = () => {
    setDesktopPage((prev) => Math.max(0, prev - 1));
    setIsAutoSlideActive(false);
  };

  const goToNextPage = () => {
    const maxPage = Math.max(0, Math.ceil(galleryPhotos.length / photosPerPage) - 1);
    setDesktopPage((prev) => Math.min(maxPage, prev + 1));
    setIsAutoSlideActive(false);
  };

  const setPage = (page: number) => {
    setDesktopPage(page);
    setIsAutoSlideActive(false);
  };

  const setMobileIndex = (index: number) => {
    setMobileCurrentIndex(index);
    setIsAutoSlideActive(false);
  };

  const currentPagePhotos = galleryPhotos.slice(
    desktopPage * photosPerPage,
    (desktopPage + 1) * photosPerPage
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, currentIndex, goToPrevious, goToNext, closeLightbox]);

  if (galleryPhotos.length === 0) {
    return (
      <section id="gallery" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>No photos available yet.</p>
        </div>
      </section>
    );
  }

  const heading = title ?? "Furry Friends Gallery";
  const subheading = description ?? "Paws, whiskers, and wagging tails - memories of our adorable guests!";

  const sectionClassName =
    variant === "profile" ? "py-10 bg-transparent" : "py-16 bg-gray-50";

  const containerClassName =
    variant === "profile"
      ? "max-w-5xl mx-auto px-0 md:px-4"
      : "container mx-auto px-4";

  return (
    <section id="gallery" className={sectionClassName}>
      <div className={containerClassName}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{heading}</h2>
          <p className="mt-4 text-xl text-gray-600">{subheading}</p>
        </div>

        {/* Mobile Photo Carousel (visible only on mobile) */}
        <div className="block sm:hidden mb-8">
          <div className="relative">
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-md">
              <Image
                src={galleryPhotos[mobileCurrentIndex].src}
                alt={galleryPhotos[mobileCurrentIndex].alt}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: "contain" }}
              />
            </div>

            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-3 transition-colors duration-200 shadow-lg"
              onClick={goToPreviousMobile}
              aria-label="Previous image"
            >
              <FaArrowLeft className="text-gray-800" />
            </button>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/60 hover:bg-white/80 rounded-full p-3 transition-colors duration-200 shadow-lg"
              onClick={goToNextMobile}
              aria-label="Next image"
            >
              <FaArrowRight className="text-gray-800" />
            </button>

            <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2 pt-2">
              {galleryPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileIndex(i)}
                  className="transition-colors duration-200 p-1"
                >
                  <FaPaw
                    className={`${
                      i === mobileCurrentIndex
                        ? "text-[#F28C38]"
                        : "text-gray-400"
                    } ${i === mobileCurrentIndex ? "text-base" : "text-sm"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Photo Grid with Pagination */}
        <div className="hidden sm:block">
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[800px] overflow-hidden">
              {currentPagePhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="relative overflow-hidden rounded-lg shadow-md cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  onClick={() =>
                    openLightbox(photo, index + desktopPage * photosPerPage)
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "contain" }}
                      className="transition-all duration-300"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {desktopPage > 0 && (
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300"
                onClick={goToPreviousPage}
                aria-label="Previous page"
              >
                <FaArrowLeft className="text-[#1A9CB0] text-xl" />
              </button>
            )}
            {desktopPage < Math.ceil(galleryPhotos.length / photosPerPage) - 1 && (
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300"
                onClick={goToNextPage}
                aria-label="Next page"
              >
                <FaArrowRight className="text-[#1A9CB0] text-xl" />
              </button>
            )}

            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({
                length: Math.max(1, Math.ceil(galleryPhotos.length / photosPerPage)),
              }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === desktopPage ? "bg-[#1A9CB0] w-4" : "bg-gray-300"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeLightbox();
                }
              }}
            >
              <motion.div
                className="relative max-w-4xl max-h-[90vh] w-full mx-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors duration-200"
                  onClick={closeLightbox}
                >
                  <FaTimes className="text-white text-xl" />
                </button>

                <button
                  className="absolute left-0 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 rounded-full p-3 transition-colors duration-200 z-20 ml-2 md:ml-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  aria-label="Previous image"
                >
                  <FaArrowLeft className="text-white text-base md:text-lg" />
                </button>

                <button
                  className="absolute right-0 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/40 hover:bg-white/60 rounded-full p-3 transition-colors duration-200 z-20 mr-2 md:mr-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToNext();
                  }}
                  aria-label="Next image"
                >
                  <FaArrowRight className="text-white text-base md:text-lg" />
                </button>

                <div className="relative w-full" style={{ height: "80vh" }}>
                  <Image
                    src={selectedPhoto.src}
                    alt={selectedPhoto.alt}
                    fill
                    sizes="100vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </motion.div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                {galleryPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(galleryPhotos[i]);
                      setCurrentIndex(i);
                      setIsAutoSlideActive(false);
                    }}
                    className={`transition-colors duration-200 p-1`}
                  >
                    <FaPaw
                      className={`${
                        i === currentIndex ? "text-[#F28C38]" : "text-white/50"
                      } ${i === currentIndex ? "text-xl" : "text-base"}`}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PhotoGallery;
