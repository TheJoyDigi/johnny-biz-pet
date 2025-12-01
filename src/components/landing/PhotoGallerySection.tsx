import PhotoGallery, { Photo } from "../photo-gallery";

type PhotoGallerySectionProps = {
  photos: Photo[];
  title?: string;
  description?: string;
  variant?: "landing" | "profile";
};

function PhotoGallerySection({ photos, title, description, variant = "landing" }: PhotoGallerySectionProps) {
  if (photos.length === 0) return null;

  return <PhotoGallery photos={photos} title={title} description={description} variant={variant} />;
}

export default PhotoGallerySection;
