import React, { useState } from "react";

const ImageWithSkeleton: React.FC<
  React.ImgHTMLAttributes<HTMLImageElement>
> = ({ src, alt, className, onLoad, onError, ...rest }) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setImageLoaded(true);
    if (onLoad) {
      onLoad(event);
    }
  };

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setImageError(true);
    setImageLoaded(false);

    if (onError) {
      onError(event);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
    >
      {!imageLoaded && !imageError && (
        <div
          className="absolute inset-0 bg-gray-50 animate-pulse"
          aria-hidden="true"
        ></div>
      )}

      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Error
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`block w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ visibility: imageLoaded ? "visible" : "hidden" }}
        {...rest}
      />
    </div>
  );
};

export default ImageWithSkeleton;
