import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Zap, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { Globe } from './components/Globe';
import { WeatherInfo } from './components/WeatherInfo';

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationData>();
  const [selectedDate, setSelectedDate] = useState<string>();
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const handleLocationSelect = (location: string, date: string, lat: number, lon: number) => {
    setSelectedLocation({ name: location, lat, lon });
    setSelectedDate(date);
    setControlsEnabled(true);
  };

  const handleReset = () => {
    setSelectedLocation(undefined);
    setSelectedDate(undefined);
    setControlsEnabled(true);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-900/20" />
      
      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-2">
            Zeus <Zap className="text-blue-400" size={32} />
          </h1>
        </div>
        <SearchBar onLocationSelect={handleLocationSelect} />
      </div>

      {/* Globe Controls */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
        <button 
          onClick={handleReset}
          className="p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl
                   text-white transition-colors duration-200 backdrop-blur-sm group"
          title="Reset View"
        >
          <RotateCcw className="w-6 h-6 group-hover:text-blue-400" />
        </button>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm flex flex-col gap-2">
          <ZoomIn className="w-6 h-6 text-slate-400" />
          <div className="h-24 w-0.5 mx-auto bg-slate-700" />
          <ZoomOut className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* 3D Globe */}
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <Globe selectedLocation={selectedLocation} />
        </Suspense>
        <OrbitControls
          enablePan={controlsEnabled}
          enableZoom={true}
          minDistance={2}
          maxDistance={10}
          zoomSpeed={0.5}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Weather Information */}
      {selectedLocation && selectedDate && (
        <WeatherInfo 
          location={selectedLocation.name} 
          date={selectedDate}
          lat={selectedLocation.lat}
          lon={selectedLocation.lon}
        />
      )}
    </div>
  );
}

export default App;