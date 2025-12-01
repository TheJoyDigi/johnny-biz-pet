import { useEffect, useRef } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { SitterReview } from "@/data/sitters";

type ReviewsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  reviews: SitterReview[];
};

const ReviewsDialog = ({ isOpen, onClose, reviews }: ReviewsDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div 
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reviews-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-white z-10">
          <h2 id="reviews-dialog-title" className="text-xl sm:text-2xl font-bold text-[#333333]">
            Verified Reviews <span className="text-gray-400 font-normal text-lg ml-1">({reviews.length})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
          {reviews.map((review, index) => (
            <div key={`${review.id || index}`} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#1A9CB0]/10 text-[#1A9CB0] flex items-center justify-center font-semibold shrink-0 text-lg">
                  {review.client.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-[#333333] text-lg">{review.client}</h3>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 font-medium">Pet: {review.pet}</p>
                  <div className="flex items-center gap-1 text-[#F6C343] mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <FaStar key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer (optional, maybe just padding) */}
        <div className="p-2 bg-gray-50 border-t border-gray-100 sm:hidden">
            <button 
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsDialog;
