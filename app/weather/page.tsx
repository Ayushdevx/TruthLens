"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWeather } from "@/lib/api/weatherApi";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PinContainer } from "@/components/ui/3d-pin";
import {
  Cloud,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  ClockIcon,
  Calendar,
  Plus,
  Trash2,
  CloudLightning,
  CloudSnow,
  CloudFog
} from "lucide-react";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale
);

// AQI level utility function
const getAQILevel = (aqi: number) => {
  if (aqi <= 50) return { level: "Good", color: "text-green-400" };
  if (aqi <= 100) return { level: "Moderate", color: "text-yellow-400" };
  if (aqi <= 150) return { level: "Unhealthy for Sensitive Groups", color: "text-orange-400" };
  if (aqi <= 200) return { level: "Unhealthy", color: "text-red-400" };
  if (aqi <= 300) return { level: "Very Unhealthy", color: "text-purple-400" };
  return { level: "Hazardous", color: "text-red-600" };
};

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface WeatherDay {
  date: string;
  day: {
    avgtemp_c: number;
    maxtemp_c: number;
    maxwind_kph: number;
    avghumidity: number;
    totalprecip_mm: number;
    condition: {
      text: string;
    };
    air_quality?: {
      pm2_5: number;
    };
    uv: number;
    avgvis_km: number;
  };
}

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center justify-center gap-2 text-4xl font-bold text-white text-center mb-4 mt-20"
    >
      <ClockIcon className="h-8 w-8" />
      <span>{time.toLocaleTimeString()}</span>
    </motion.div>
  );
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <Card className="bg-gray-800 p-4">
      <CardHeader>
        <h3 className="text-xl font-bold text-white">Weather-Related Tasks</h3>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a weather-related task..."
            className="bg-gray-700 text-white"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <Button onClick={addTodo} className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex items-center gap-2 mb-2"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <span
                className={`flex-1 text-white ${
                  todo.completed ? "line-through opacity-50" : ""
                }`}
              >
                {todo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

interface WeatherCardProps {
  day: WeatherDay;
  index: number;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ day, index }) => {
  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
  
  const getWeatherIcon = (condition: string, isNight: boolean) => {
    if (condition.includes('rain')) return <CloudRain className="h-16 w-16 text-blue-400" />;
    if (condition.includes('cloud')) return <Cloud className="h-16 w-16 text-gray-400" />;
    if (condition.includes('snow')) return <CloudSnow className="h-16 w-16 text-white" />;
    if (condition.includes('thunder')) return <CloudLightning className="h-16 w-16 text-yellow-400" />;
    if (condition.includes('fog') || condition.includes('mist')) return <CloudFog className="h-16 w-16 text-gray-400" />;
    return isNight ? 
      <Moon className="h-16 w-16 text-yellow-200" /> : 
      <Sun className="h-16 w-16 text-yellow-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="backdrop-blur-lg bg-opacity-30 bg-gray-800 rounded-xl p-6 shadow-2xl"
    >
      <div className="flex flex-col items-center space-y-4">
        <h3 className="font-bold text-xl text-white">
          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
        </h3>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 1 }}
          className="text-5xl"
        >
          {getWeatherIcon(day.day.condition.text.toLowerCase(), isNight)}
        </motion.div>
        <div className="text-5xl font-bold text-white">{day.day.avgtemp_c}°C</div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 w-full">
          <div className="flex items-center">
            <Wind className="h-4 w-4 mr-2" />
            {day.day.maxwind_kph} km/h
          </div>
          <div className="flex items-center">
            <Droplets className="h-4 w-4 mr-2" />
            {day.day.avghumidity}%
          </div>
          <div className="flex items-center">
            <CloudRain className="h-4 w-4 mr-2" />
            {day.day.totalprecip_mm} mm
          </div>
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-2" />
            {day.day.maxtemp_c}°C
          </div>
          {day.day.air_quality && (
            <div className="col-span-2">
              <div className={`flex items-center justify-center ${getAQILevel(day.day.air_quality.pm2_5).color}`}>
                AQI: {Math.round(day.day.air_quality.pm2_5)} 
                <span className="ml-2 text-xs">({getAQILevel(day.day.air_quality.pm2_5).level})</span>
              </div>
            </div>
          )}
          <div className="col-span-2 text-xs text-center mt-2">
            <div>UV Index: {day.day.uv}</div>
            <div>Visibility: {day.day.avgvis_km} km</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      labels: { font: { size: 14, color: '#ffffff' } },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(255, 255, 255, 0.1)" },
      ticks: { color: "#ffffff" }
    },
    y: {
      grid: { color: "rgba(255, 255, 255, 0.1)" },
      ticks: { color: "#ffffff" }
    }
  }
};

export default function WeatherDashboard() {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await getWeather(`${latitude},${longitude}`);
      });
    }
  }, []);

  async function getWeather(loc: string) {
    setLoading(true);
    try {
      const data = await fetchWeather(loc);
      setWeather(data);
      prepareChartData(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
    setLoading(false);
  }

  function prepareChartData(data: any) {
    const labels = data.forecast.forecastday.map((day: any) => day.date);
    setChartData({
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: data.forecast.forecastday.map((day: any) => day.day.avgtemp_c),
          borderColor: "rgba(78, 238, 232, 1)",
          backgroundColor: "rgba(78, 238, 232, 0.2)",
          tension: 0.4,
        },
        {
          label: "Humidity (%)",
          data: data.forecast.forecastday.map((day: any) => day.day.avghumidity),
          borderColor: "rgba(132, 99, 255, 1)",
          backgroundColor: "rgba(132, 99, 255, 0.2)",
          tension: 0.4,
        }
      ],
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <LiveClock />
        
        <div className="text-center text-white text-xl">
          <Calendar className="inline-block mr-2 h-6 w-6" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        <PinContainer title={location || "Set Location"} href="#">
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center p-4">
            <Input
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="max-w-xs bg-gray-800 text-white"
              onKeyPress={(e) => e.key === 'Enter' && getWeather(location)}
            />
            <Button
              onClick={() => getWeather(location)}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-300"
            >
              {loading ? "Loading..." : "Get Weather"}
            </Button>
          </div>
        </PinContainer>

        {weather && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weather.forecast.forecastday.map((day: WeatherDay, index: number) => (
                <WeatherCard key={day.date} day={day} index={index} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 bg-opacity-30 backdrop-blur-lg p-6 rounded-xl shadow-2xl"
            >
              <h2 className="text-center text-2xl font-bold text-white mb-4">
                Weather Trends
              </h2>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </motion.div>

            <TodoList />
          </div>
        )}
      </motion.div>
    </div>
  );
}