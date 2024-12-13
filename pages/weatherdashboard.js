import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO, subHours, subDay, startOfYesterday, startOfHour,
  endOfYesterday, startOfDay, endOfDay } from 'date-fns';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, query, orderByChild, limitToLast, serverTimestamp, push, set } from 'firebase/database';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';




  // Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaJXwzCGoqpJKgSv4TDxh0-CauoWj13Yc",
  authDomain: "weatherstation-474f2.firebaseapp.com",
  databaseURL: "https://weatherstation-474f2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "weatherstation-474f2",
  storageBucket: "weatherstation-474f2.firebasestorage.app",
  messagingSenderId: "315579475162",
  appId: "1:315579475162:web:73d7181416428c9c96f1e3",
  measurementId: "G-SQ61MJC5PG"
};

// Initialize Firebase only if no app exists
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);
const auth = getAuth(app);;


const WeatherHistoryCard = ({ historicalData, theme }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const filteredData = useMemo(() => {
    let processedData = historicalData;

    if (timeFilter === 'hour') {
      const now = new Date();
      const startOfToday = startOfDay(now);
      const endOfToday = endOfDay(now);
    
      processedData = historicalData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startOfToday && entryDate <= endOfToday;
      });
    }
      
    else if (timeFilter === 'custom' && selectedStartDate && selectedEndDate) {
      const startOfSelectedDate = startOfDay(new Date(selectedStartDate));
      const endOfSelectedDate = startOfDay(new Date(selectedEndDate));
      endOfSelectedDate.setDate(endOfSelectedDate.getDate() + 1); // Include entire end date

      processedData = historicalData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startOfSelectedDate && entryDate < endOfSelectedDate;
      });
    }
// Sort the final data in descending order by timestamp
return processedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}, [historicalData, timeFilter, selectedStartDate, selectedEndDate]);

// Button style generator
const getButtonStyle = (filterType) => {
  const baseStyle = "px-3 py-1 rounded-md text-sm mr-2 transition-colors duration-200";
  const activeStyle = theme === 'dark' 
    ? 'bg-blue-600 text-white' 
    : 'bg-blue-500 text-white';
  const inactiveStyle = theme === 'dark'
    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  
  return `${baseStyle} ${timeFilter === filterType ? activeStyle : inactiveStyle}`;
};
      
return (
  <div 
    className={`${theme === 'dark' 
      ? 'bg-gray-800 bg-opacity-70 border-gray-700' 
      : 'bg-gray-100 bg-opacity-80 border-gray-300'} 
      rounded-xl p-4 shadow-2xl border-2 relative overflow-hidden`}
  >
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Weather History
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeFilter('all')}
            className={getButtonStyle('all')}
          >
            All Time
          </button>
          <button 
            onClick={() => setTimeFilter('hour')}
            className={getButtonStyle('hour')}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeFilter('custom')}
            className={getButtonStyle('custom')}
          >
            Select Date
          </button>
        </div>
      </div>

      {timeFilter === 'custom' && (
        <div className="flex space-x-4 items-center">
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="start-date" 
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Start Date:
            </label>
            <input 
              type="date" 
              id="start-date"
              value={selectedStartDate || ''}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              className={`p-2 rounded ${theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'}`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <label 
              htmlFor="end-date" 
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
            >
              End Date:
            </label>
            <input 
              type="date" 
              id="end-date"
              value={selectedEndDate || ''}
              onChange={(e) => setSelectedEndDate(e.target.value)}
              className={`p-2 rounded ${theme === 'dark' 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-900 border-gray-300'}`}
            />
          </div>
        </div>
      )}
    </div>
    
    <div className="max-h-[400px] overflow-y-auto">
      <table className={`w-full ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
        <thead>
          <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}>
            <th className="p-2 text-left">Timestamp</th>
            <th className="p-2 text-left">Temp (°C)</th>
            <th className="p-2 text-left">Humidity (%)</th>
            <th className="p-2 text-left">Pressure (hPa)</th>
            <th className="p-2 text-left">Rain (mm)</th>
            <th className="p-2 text-left">Light</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry, index) => {
            const timestamp = entry.timestamp ? new Date(entry.timestamp).toISOString() : 'Invalid Timestamp';
            return (
              <tr
                key={entry.id || index}
                className={`${index % 2 === 0
                    ? theme === 'dark'
                      ? 'bg-gray-900'
                      : 'bg-gray-100'
                    : theme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-white'
                  }`}
              >
                <td className="p-2">
                  {timestamp !== 'Invalid Timestamp'
                    ? format(parseISO(timestamp), 'MM/dd/yyyy HH:mm:ss')
                    : 'Invalid Timestamp'}
                </td>
                <td className="p-2">{entry.temperature.toFixed(1)}</td>
                <td className="p-2">{entry.humidity.toFixed(1)}</td>
                <td className="p-2">{entry.pressure.toFixed(1)}</td>
                <td className="p-2">{entry.rain.toFixed(1)}</td>
                <td className="p-2">{entry.light}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <div className={`text-center p-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          No data available for the selected time period.
        </div>
      )}
    </div>
  </div>
);
};


      

          const CircularGauge = ({
            value,
            max,
            title,
            fahrenheit,
            tempLabel,
            labelColor,
            indicatorColor,
            humidityLabel,
            humidityLabelColor,
            rainLabel,
            rainLabelColor,
            lightLabel,
            lightLabelColor,
            pressureLabel,
            pressureLabelColor,
            theme
          }) => {
            const [isFlickering, setIsFlickering] = useState(false);
            
            
            // Determine if the reading is dangerous based on the title and value
            const isDangerous = () => {
              switch(title) {
                case 'Temperature (°C)':
                  return value > 40 || value < 0;
                  case 'Humidity (%)':
                    return value > 90 || value < 20;
                    case 'Rain (mm)':
                      return value > 800;
                      case 'Pressure (hPa)':
                        return value < 980 || value > 1040;
                        case 'Light':
                          return false; // No dangerous threshold for light
                          default:
                            return false;
                          }
                        };
                        
                        // Trigger flicker effect when dangerous conditions are detected
                        useEffect(() => {
                          if (isDangerous()) {
                            const flickerInterval = setInterval(() => {
                              setIsFlickering(prev => !prev);
                            }, 500); // Flicker every 500ms
                            
                            return () => clearInterval(flickerInterval);
                          } else {
                            setIsFlickering(false);
                          }
                        }, [value, title]);
                        
              
            const progressAngle = Math.min((value / max) * 360, 360);

            const bgClasses = theme === 'dark' 
              ? 'bg-gray-800 bg-opacity-70 border-gray-700' 
              : 'bg-gray-100 bg-opacity-80 border-gray-300';
            
            const textClasses = theme === 'dark' 
              ? 'text-gray-100' 
              : 'text-gray-900';
            
            const subtitleClasses = theme === 'dark' 
              ? 'text-gray-300' 
              : 'text-gray-700';

            const svgValueColor = theme === 'dark' 
              ? 'text-white' 
              : 'text-gray-900';

        // Danger flicker classes
        const dangerFlickerClass = isFlickering 
        ? 'animate-[flicker_0.1s_infinite_alternate]' 
        : '';


    return (
      <div 
      className={`${bgClasses} rounded-xl p-4 shadow-2xl border-2 relative overflow-hidden ${textClasses} ${isDangerous() ? 'border-red-500 border-4' : ''} ${dangerFlickerClass}`}
    >
      <div className={`absolute inset-0 ${theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
        : 'bg-gradient-to-br from-gray-200 to-blue-200'} opacity-50 -z-10`}></div>
      
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-pattern"></div>
      
      <div className="relative flex flex-col items-center">
        <h3 className={`text-sm ${subtitleClasses} mb-4 tracking-wider uppercase ${isDangerous() ? 'text-red-500' : ''}`}>
          {title} {isDangerous() && '⚠️'}
        </h3>
        
        <svg 
          className="w-72 h-72 flex-shrink-0"
          viewBox="0 0 250 250"
        >
          <path
            d="M125 25 A100 100 0 1 1 124.9 25"
            fill="none"
            stroke={theme === 'dark' ? '#334155' : '#a0aec0'}
            strokeWidth="20"
          />
          
          <path
            d="M125 25 A100 100 0 1 1 124.9 25"
            fill="none"
            stroke={isDangerous() ? 'red' : (indicatorColor || 'yellow')}
            strokeWidth="20"
            strokeDasharray="628.3"
            strokeDashoffset={628.3 - (progressAngle / 360) * 628.3}
            style={{
              transition: 'stroke-dashoffset 0.5s ease',
              transformOrigin: 'center',
            }}
          />
          
          <text 
            x="125" 
            y="110" 
            textAnchor="middle" 
            dy=".5em" 
            className={`text-2xl font-bold ${svgValueColor} ${isDangerous() ? 'text-red-500' : ''}`}
            fill={isDangerous() ? 'red' : (indicatorColor || 'yellow')}
          >
           {title === 'Pressure (hPa)' 
          ? `${value} hPa` 
          : title === 'Rain (mm)' 
          ? `${value} mm`
          : title === 'Humidity (%)'
          ? `${value} %`
          : title === 'Light'
          ? `${value}`
          : `${value} °C`
           }
           </text> 

           {fahrenheit && title === 'Temperature (°C)' && (
  <text 
    x="125" 
    y="160" 
    textAnchor="middle" 
    dy=".3em" 
    className={`text-xl font-semibold ${
      isDangerous() 
        ? 'text-red-500' 
        : theme === 'dark' 
          ? 'text-blue-300' 
          : 'text-blue-700'
    } ${isDangerous() ? 'animate-pulse' : ''}`}
    fill={
      isDangerous() 
        ? 'red' 
        : theme === 'dark' 
          ? '#93C5FD' // Light blue for dark mode 
          : '#1D4ED8'  // Dark blue for light mode
    }
  >
    {fahrenheit}°F
  </text>
)}
        </svg>
  
          <div className="mt-4 w-full space-y-2">
            {fahrenheit && tempLabel && (
              <div 
                className={`p-3 text-sm rounded flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ 
                  backgroundColor: labelColor,
                }}
              >
                <span>Temperature Status</span>
                <span>{tempLabel}</span>
              </div>
            )}
            {humidityLabel && (
              <div 
                className={`p-3 text-sm rounded flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ 
                  backgroundColor: humidityLabelColor,
                }}
              >
                <span>Humidity Status</span>
                <span>{humidityLabel}</span>
              </div>
            )}
            {rainLabel && (
              <div 
                className={`p-3 text-sm rounded flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ 
                  backgroundColor: rainLabelColor,
                }}
              >
                <span>Precipitation</span>
                <span>{rainLabel}</span>
              </div>
            )}
            {lightLabel && (
              <div 
                className={`p-3 text-sm rounded flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ 
                  backgroundColor: lightLabelColor,
                }}
              >
                <span>Light Condition</span>
                <span>{lightLabel}</span>
              </div>
            )}
            {pressureLabel && (
              <div 
                className={`p-3 text-sm rounded flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{ 
                  backgroundColor: pressureLabelColor,
                }}
              >
                <span>Air Pressure</span>
                <span>{pressureLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const celsiusToFahrenheit = (celsius) => {
    return ((celsius * 9) / 5 + 32).toFixed(1);
  };

  const getTemperatureLabel = (celsius, theme) => {
    const darkColors = {
      chilly: { label: "Chilly", labelColor: "#1E3A8A", indicatorColor: "#3B82F6" },      // Dark Blue
      cool: { label: "Cool", labelColor: "#14532D", indicatorColor: "#10B981" },          // Dark Green
      warm: { label: "Warm", labelColor: "#7C2D12", indicatorColor: "#F97316" },          // Dark Orange
      hot: { label: "Hot", labelColor: "#7C2D12", indicatorColor: "#EAB308" },            // Dark Yellow
      superHot: { label: "Super Hot", labelColor: "#7F1D1D", indicatorColor: "#EF4444" }  // Dark Red
    };
  
    const lightColors = {
      chilly: { label: "Chilly", labelColor: "#BFDBFE", indicatorColor: "#2196F3" },      // Light Blue
      cool: { label: "Cool", labelColor: "#DCFCE7", indicatorColor: "#4CAF50" },          // Light Green
      warm: { label: "Warm", labelColor: "#FED7AA", indicatorColor: "#FF9800" },          // Light Orange
      hot: { label: "Hot", labelColor: "#FF6161", indicatorColor: "#BFAE19" },            // Light Yellow
      superHot: { label: "Super Hot", labelColor: "#FEE2E2", indicatorColor: "#F44336" }  // Light Red
    };
  
    const colors = theme === 'dark' ? darkColors : lightColors;
  
    if (celsius < 10) return colors.chilly;
    if (celsius < 20) return colors.cool;
    if (celsius < 30) return colors.warm;
    if (celsius < 40) return colors.hot;
    return colors.superHot;
  };
  
  const getHumidityLabel = (humidity, theme) => {
    const darkColors = {
      dry: { label: "Dry", labelColor: "#1E3A8A", indicatorColor: "#3B82F6" },
      comfortable: { label: "Comfortable", labelColor: "#14532D", indicatorColor: "#10B981" },
      humid: { label: "Humid", labelColor: "#713F12", indicatorColor: "#D97706" },
      veryHumid: { label: "Very Humid", labelColor: "#7C2D12", indicatorColor: "#F44336" }
    };
  
    const lightColors = {
      dry: { label: "Dry", labelColor: "#BFDBFE", indicatorColor: "#2196F3" },
      comfortable: { label: "Comfortable", labelColor: "#DCFCE7", indicatorColor: "#4CAF50" },
      humid: { label: "Humid", labelColor: "#FEF3C7", indicatorColor: "#FFA000" },
      veryHumid: { label: "Very Humid", labelColor: "#FEE2E2", indicatorColor: "#FF5722" }
    };
  
    const colors = theme === 'dark' ? darkColors : lightColors;
  
    if (humidity <= 30) return colors.dry;
    if (humidity <= 50) return colors.comfortable;
    if (humidity <= 70) return colors.humid;
    return colors.veryHumid;
  };
  
  const getRainLabel = (rain, theme) => {
    const darkColors = {
      noRain: { label: "No Rain", labelColor: "#1E3A8A", indicatorColor: "#2196F3" },
      lightDrizzle: { label: "Light Drizzle", labelColor: "#155E75", indicatorColor: "#0EA5E9" },
      lightRain: { label: "Light Rain", labelColor: "#14532D", indicatorColor: "#10B981" },
      moderateRain: { label: "Moderate Rain", labelColor: "#713F12", indicatorColor: "#D97706" },
      heavyRain: { label: "Heavy Rain", labelColor: "#7C2D12", indicatorColor: "#EF4444" },
      extremeRain: { label: "Extreme Rainfall", labelColor: "#7F1D1D", indicatorColor: "#B91C1C" }
    };
  
    const lightColors = {
      noRain: { label: "No Rain", labelColor: "#BFDBFE", indicatorColor: "#2196F3" },
      lightDrizzle: { label: "Light Drizzle", labelColor: "#E0F2FE", indicatorColor: "#03A9F4" },
      lightRain: { label: "Light Rain", labelColor: "#DCFCE7", indicatorColor: "#4CAF50" },
      moderateRain: { label: "Moderate Rain", labelColor: "#FEF3C7", indicatorColor: "#FFC107" },
      heavyRain: { label: "Heavy Rain", labelColor: "#FED7AA", indicatorColor: "#FF5722" },
      extremeRain: { label: "Extreme Rainfall", labelColor: "#FEE2E2", indicatorColor: "#EF4444" }
    };
  
    const colors = theme === 'dark' ? darkColors : lightColors;
  
    if (rain === 0) return colors.noRain;
    if (rain <= 250) return colors.lightDrizzle;
    if (rain <= 500) return colors.lightRain;
    if (rain <= 750) return colors.moderateRain;
    if (rain <= 950) return colors.heavyRain;
    return colors.extremeRain;
  };
  
  const getLightLabel = (lightValue, theme) => {
    const darkColors = {
      veryDark: { label: "Very Dark", labelColor: "#1F2937", indicatorColor: "#4B5563" },
      dark: { label: "Dark", labelColor: "#374151", indicatorColor: "#6B7280" },
      dimLight: { label: "Dim Light", labelColor: "#4B5563", indicatorColor: "#9CA3AF" },
      mediumLight: { label: "Medium Light", labelColor: "#854D0E", indicatorColor: "#D97706" },
      brightLight: { label: "Bright", labelColor: "#064E3B", indicatorColor: "#10B981" },
      veryBright: { label: "Very Bright", labelColor: "#1E3A8A", indicatorColor: "#3B82F6" }
    };
  
    const lightColors = {
      veryDark: { label: "Very Dark", labelColor: "#E5E7EB", indicatorColor: "#9CA3AF" },
      dark: { label: "Dark", labelColor: "#F3F4F6", indicatorColor: "#6B7280" },
      dimLight: { label: "Dim Light", labelColor: "#F9FAFB", indicatorColor: "#D1D5DB" },
      mediumLight: { label: "Medium Light", labelColor: "#FEF3C7", indicatorColor: "#FBBF24" },
      brightLight: { label: "Bright", labelColor: "#DCFCE7", indicatorColor: "#4CAF50" },
      veryBright: { label: "Very Bright", labelColor: "#BFDBFE", indicatorColor: "#2196F3" }
    };
  
    const colors = theme === 'dark' ? darkColors : lightColors;
  
    // More granular thresholds and dynamic indicator colors
    if (lightValue >= 990) return colors.veryBright;
    if (lightValue >= 700) return { 
      ...colors.brightLight, 
      indicatorColor: `hsl(${Math.floor((lightValue - 700) / 200 * 60 + 120)}, 70%, 50%)` 
    };
    if (lightValue >= 500) return { 
      ...colors.mediumLight, 
      indicatorColor: `hsl(${Math.floor((lightValue - 500) / 200 * 60 + 60)}, 70%, 50%)` 
    };
    if (lightValue >= 300) return { 
      ...colors.dimLight, 
      indicatorColor: `hsl(${Math.floor((lightValue - 300) / 200 * 60)}, 70%, 50%)` 
    };
    if (lightValue >= 100) return colors.dark;
    return colors.veryDark;
  };

  
  const getPressureLabel = (pressure, theme) => {
    const darkColors = {
      lowPressure: { label: "Low Pressure", labelColor: "#7F1D1D", indicatorColor: "#EF4444" },
      slightlyLow: { label: "Slightly Low", labelColor: "#7C2D12", indicatorColor: "#F97316" },
      normal: { label: "Normal", labelColor: "#14532D", indicatorColor: "#10B981" },
      highNormal: { label: "High Normal", labelColor: "#064E3B", indicatorColor: "#14B8A6" },
      highPressure: { label: "High Pressure", labelColor: "#1E3A8A", indicatorColor: "#3B82F6" }
    };
  
    const lightColors = {
      lowPressure: { label: "Low Pressure", labelColor: "#FEE2E2", indicatorColor: "#F44336" },
      slightlyLow: { label: "Slightly Low", labelColor: "#FED7AA", indicatorColor: "#FF9800" },
      normal: { label: "Normal", labelColor: "#DCFCE7", indicatorColor: "#4CAF50" },
      highNormal: { label: "High Normal", labelColor: "#CCFBF1", indicatorColor: "#14B8A6" },
      highPressure: { label: "High Pressure", labelColor: "#BFDBFE", indicatorColor: "#2196F3" }
    };


    const colors = theme === 'dark' ? darkColors : lightColors;
  
    if (pressure < 980) return colors.lowPressure;
    if (pressure < 1000) return colors.slightlyLow;
    if (pressure < 1013) return colors.normal;
    if (pressure < 1020) return colors.highNormal;
    return colors.highPressure;
  };



  const WeatherDashboard = () => {
    const [data, setData] = useState({
      temperature: 0,
      humidity: 0,
      rain: 0,
      light: 0,
      pressure: 0
    });
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [historicalData, setHistoricalData] = useState([]);

      // New authentication state
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If no user is logged in, redirect to Sign In page
        router.push('/');
      } else {
        setUser(currentUser);
      }
    });
    
    // Clean up the listener
    return () => unsubscribe();
  }, [router]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to Sign In page after logging out
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
    const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    // Fetch historical data from Firebase
    // Fetch historical data from Firebase
  const fetchHistoricalData = async () => {
    try {
      const db = getDatabase();
      const historicalDataRef = ref(db, 'weather_now');
      const snapshot = await get(historicalDataRef);

      if (snapshot.exists()) {
        const historicalEntries = Object.entries(snapshot.val()).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setHistoricalData(historicalEntries.reverse()); // Reverse to show latest first
      } else {
        console.log('No historical data found.');
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError(err);
    }
  };
    
    
    // Fetch weather data from local server and update Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/weather');
        if (response.data.length > 0) {
          const latestData = response.data[0];
          latestData.light = typeof latestData.light === 'string' 
          ? (latestData.light === 'HIGH' ? 1023 : 0) 
          : latestData.light;
        
        setData(latestData);
        setError(null);
        setIsConnected(true);
  
        // Fetch historical data
        fetchHistoricalData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
      setIsConnected(false);
    }
  };

    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 1000); // Fetch new data every 2 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  },  []);

  

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={`${theme === 'dark' ? 'bg-red-900 bg-opacity-70' : 'bg-red-200 bg-opacity-80'} p-8 rounded-xl text-center ${theme === 'dark' ? 'text-white' : 'text-red-900'}`}>
          <div className="text-4xl mb-4">🌩️</div>
          <h2 className="text-2xl mb-4">Weather Station Offline</h2>
          <p className={theme === 'dark' ? 'text-red-200' : 'text-red-700'}>Unable to fetch weather data. Please check connection.</p>
        </div>
      </div>
    );
  }
  const temp = getTemperatureLabel(data.temperature, theme);
  const humidity = getHumidityLabel(data.humidity, theme);
  const rain = getRainLabel(data.rain, theme);
  const light = getLightLabel(data.light, theme);
  const pressure = getPressureLabel(data.pressure, theme);

return (
  <div className={`min-h-screen ${theme === 'dark' 
    ? 'bg-gradient-to-br from-gray-900 to-blue-900' 
    : 'bg-gradient-to-br from-gray-200 to-blue-200'} 
    flex items-center justify-center p-4 md:p-8 lg:p-12`}>
    <div className="w-full max-w-7xl mx-auto">
      <div className={`${theme === 'dark' 
        ? 'bg-gray-900 bg-opacity-50 border-gray-800' 
        : 'bg-white bg-opacity-70 border-gray-300'} 
        rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl border-2 w-full`}>
        <div className="flex items-center justify-between mb-6">
          <div className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Weather Monitoring Station
            </h1>
            <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isConnected ? 'Live Data Stream' : 'Connection Lost'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🌦️</div>
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-full transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
               {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={handleLogout}
              className={`p-3 rounded-full transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-red-700 text-white hover:bg-red-600' 
                  : 'bg-red-200 text-red-800 hover:bg-red-300'
              }`}
            >
              🚪Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 mb-10">
          <CircularGauge
            theme={theme}
            title="Temperature (°C)"
            value={data.temperature}
            max={50}
            fahrenheit={celsiusToFahrenheit(data.temperature)}
            tempLabel={temp.label}
            labelColor={temp.labelColor}
            indicatorColor={temp.indicatorColor}
            className="w-full h-80"  // Added explicit sizing
          />
          <CircularGauge
            theme={theme}
            title="Humidity (%)"
            value={data.humidity}
            max={100}
            humidityLabel={humidity.label}
            humidityLabelColor={humidity.labelColor}
            indicatorColor={humidity.indicatorColor}
            className="w-full h-80"
          />
          <CircularGauge
            theme={theme}
            title="Rain (mm)"
            value={data.rain}
            max={1000}
            rainLabel={rain.label}
            rainLabelColor={rain.labelColor}
            indicatorColor={rain.indicatorColor}
            className="w-full h-80"
          />
            <CircularGauge
            theme={theme}
            title="Light Intensity"
            value={data.light} // Now passing the actual numeric value
            max={1023} // Full range of analog read
            lightLabel={light.label}
            lightLabelColor={light.labelColor}
            indicatorColor={light.indicatorColor}
            className="w-full h-80"
          />
          <CircularGauge 
            theme={theme}
            title="Pressure (hPa)"
            value={data.pressure} 
            max={1050}
            pressureLabel={pressure.label}
            pressureLabelColor={pressure.labelColor}
            indicatorColor={pressure.indicatorColor}
            className="w-full h-80"
          />
        </div>
        
        <WeatherHistoryCard  
          historicalData={historicalData}
          theme={theme}
        />
      </div>

      <style jsx global>{`
        .bg-pattern {
          background-image: 
            linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,0.2) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.2) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.2) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
    </div>
  );
};

export default WeatherDashboard;