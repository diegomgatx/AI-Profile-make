
import React from 'react';

interface ImageCardProps {
  title: string;
  imageUrl: string;
  altText: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ title, imageUrl, altText }) => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-300 mb-2">{title}</h2>
      <div className="aspect-w-3 aspect-h-4 bg-gray-700/50 rounded-lg overflow-hidden border-2 border-gray-700">
        <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default ImageCard;
