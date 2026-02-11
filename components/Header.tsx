import React, { FC } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  isAuthenticated?: boolean;
}

const Header: FC<HeaderProps> = ({ onOpenAuth, onOpenAdmin, isAuthenticated }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">FakeAccDetector</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6">
            <a href="#features" className="text-gray-700 hover:text-red-600 font-medium">Features</a>
            <a href="#pricing" className="text-gray-700 hover:text-red-600 font-medium">Pricing</a>
            <a href="#about" className="text-gray-700 hover:text-red-600 font-medium">About</a>
          </nav>

          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={onOpenAdmin}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Dashboard
                </button>
                <button onClick={onOpenAdmin} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Admin
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
