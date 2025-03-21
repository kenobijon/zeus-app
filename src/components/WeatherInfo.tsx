import React, { useEffect, useState } from 'react';
import { Cloud, Sun, Thermometer, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchWeatherApi } from 'openmeteo';

interface WeatherInfoProps {
  location: string;
  date: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export const WeatherInfo: React.FC<WeatherInfoProps> = ({ location, date, lat, lon }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use OpenMeteo API client with string parameters
        const params = {
          "latitude": lat.toString(),
          "longitude": lon.toString(),
          "current": "temperature_2m"
        };
        
        const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);
        const response = responses[0];
        const current = response.current();

        if (!current) {
          throw new Error('No current weather data available');
        }

        const temperature = Math.round(current.variables(0)?.value() || 0);

        // Set dummy values for other fields since we're only getting temperature
        setWeatherData({
          temperature,
          condition: 'Partly cloudy', // Dummy value
          humidity: 65, // Dummy value
          windSpeed: 12 // Dummy value
        });

      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    if (location && date) {
      fetchWeatherData();
    }
  }, [location, date, lat, lon]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-8 bg-slate-800/40 backdrop-blur-md border border-slate-700 
                   rounded-2xl p-6 text-white"
      >
        <p>Loading weather data...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-8 bg-slate-800/40 backdrop-blur-md border border-slate-700 
                   rounded-2xl p-6 text-white"
      >
        <p className="text-red-400">Error: {error}</p>
      </motion.div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute bottom-8 left-8 bg-slate-800/40 backdrop-blur-md border border-slate-700 
                 rounded-2xl p-6 text-white max-w-md"
    >
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <span className="text-blue-400">{location}</span>
      </h2>
      <p className="text-slate-400 mb-4">{formatDate(date)}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Thermometer className="text-orange-400" size={24} />
          <div>
            <p className="text-xl font-semibold">{weatherData.temperature}°C</p>
            <p className="text-sm text-slate-400">Temperature</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Sun className="text-yellow-400" size={24} />
          <div>
            <p className="text-xl font-semibold">{weatherData.condition}</p>
            <p className="text-sm text-slate-400">Condition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Cloud className="text-blue-400" size={24} />
          <div>
            <p className="text-xl font-semibold">{weatherData.humidity}%</p>
            <p className="text-sm text-slate-400">Humidity</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Wind className="text-green-400" size={24} />
          <div>
            <p className="text-xl font-semibold">{weatherData.windSpeed} km/h</p>
            <p className="text-sm text-slate-400">Wind Speed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};