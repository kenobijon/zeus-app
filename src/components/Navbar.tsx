import React from 'react';
import { Zap, Info, Users, Network } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Zeus <Zap className="text-blue-400" size={32} />
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="nav-button group">
            <Info size={20} className="group-hover:text-blue-400" />
            <span>About</span>
          </button>
          <button className="nav-button group">
            <Users size={20} className="group-hover:text-blue-400" />
            <span>Team</span>
          </button>
          <button className="nav-button group">
            <Network size={20} className="group-hover:text-blue-400" />
            <span>Subnet</span>
          </button>
        </div>
      </div>
    </nav>
  );
};