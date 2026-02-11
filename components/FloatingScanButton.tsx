import React, { FC } from 'react';
import { Search } from 'lucide-react';

interface FloatingScanButtonProps {
  onClick?: () => void;
}

const FloatingScanButton: FC<FloatingScanButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-110 z-40"
      title="Quick Scan"
    >
      <Search className="w-6 h-6" />
    </button>
  );
};

export default FloatingScanButton;
