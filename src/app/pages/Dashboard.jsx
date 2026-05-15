import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Sun, Cloud, Wind, Droplets, MapPin, Search, Navigation,
  AlertTriangle, ShieldCheck, Camera, Sparkles, ScanFace,
  CheckCircle2, RefreshCw
} from 'lucide-react';
import { getUVData, skinTypes } from '../utils';
import { fetchProfile, getStoredUser } from '../services/authService';
import { fetchWeather, predictSkinType, reverseGeocode, saveHistory, searchLocations } from '../services/synarService';
import { isAuthenticated } from '../core/api';

const FREE_CHECK_STORAGE_KEY = 'synar_free_check_used';

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const getRealtimeRows = (weather) => {
  if (!weather?.current_time) return [];

  const offsetSeconds = weather.utc_offset_seconds ?? 0;
  const [datePart, timePart = '00:00:00'] = weather.current_time.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
  const localAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
  );
  const instant = new Date(localAsUtc - offsetSeconds * 1000);
  const timezone = weather.timezone || 'Asia/Jakarta';
  const abbreviation = weather.timezone_abbreviation || '';
  const offsetHours = offsetSeconds / 3600;
  const offsetLabel =
    offsetHours === 7
      ? 'WIB'
      : `UTC${offsetHours >= 0 ? '+' : ''}${Number.isInteger(offsetHours) ? offsetHours : offsetHours.toFixed(1)}`;

  const format = (timeZone) =>
    new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    }).format(instant).replace(/\./g, ':').replace(/:/g, '.');

  const wibRow = { label: 'WIB', value: format('Asia/Jakarta') };

  if (timezone === 'Asia/Jakarta' || abbreviation.toUpperCase() === 'WIB') {
    return [wibRow];
  }

  return [
    wibRow,
    { label: abbreviation || offsetLabel, value: format(timezone) },
  ];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Jakarta, Indonesia');
  const [coords, setCoords] = useState({ latitude: -6.2088, longitude: 106.8456 });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [skinType, setSkinType] = useState(3);
  const [detectMode, setDetectMode] = useState('manual');
  const [cameraState, setCameraState] = useState('idle');
  const [detectedType, setDetectedType] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [uvData, setUvData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [mlSafeTime, setMlSafeTime] = useState(null);
  const [mlRiskLevel, setMlRiskLevel] = useState(null);
  const [weatherMeta, setWeatherMeta] = useState(null);
  const [checkedLocation, setCheckedLocation] = useState('');

  const [userName, setUserName] = useState(getStoredUser()?.name || 'guest');
  const [error, setError] = useState('');

  const handleCheckUV = async () => {
    const authenticated = isAuthenticated();

    if (!authenticated && localStorage.getItem(FREE_CHECK_STORAGE_KEY) === 'true') {
      setError('Please log in to check your sun risk again.');
      window.setTimeout(() => navigate('/login'), 700);
      return;
    }

    setLoading(true);
    setShowResults(false);
    setError('');

    const locationSnapshot = location;
    const coordsSnapshot = coords;

    try {
      const weather = await fetchWeather(coordsSnapshot);
      const normalizedWeather = {
        temp: Math.round(weather.temperature),
        humidity: Math.round(weather.humidity),
        wind: Math.round(weather.wind_speed),
        cloud: Math.round(weather.cloud_cover),
      };
      const normalizedUv = Math.round(weather.uv_index);
      const nextUvData = getUVData(normalizedUv);
      const safeTime = mlSafeTime || nextUvData.safeTime;
      const riskLevel = mlRiskLevel || nextUvData.risk;

      setUvData(nextUvData);
      setWeatherData(normalizedWeather);
      setWeatherMeta(weather);
      setCheckedLocation(locationSnapshot);

      if (authenticated) {
        await saveHistory({
          skin_type: skinType,
          uv_index: normalizedUv,
          weather: normalizedWeather,
          risk_level: riskLevel,
          recommended_duration: safeTime,
          recommendation: nextUvData.index >= 6 ? 'Avoid sun exposure between 10 AM and 4 PM. Apply SPF 30+ sunscreen.' : 'Apply SPF 30+ sunscreen and reapply every 2 hours.',
          location: locationSnapshot,
          coords: coordsSnapshot,
        });
      } else {
        localStorage.setItem(FREE_CHECK_STORAGE_KEY, 'true');
      }

      setLoading(false);
      setShowResults(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to check UV risk');
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);
        try {
          setLocation(await reverseGeocode(nextCoords));
        } catch {
          setLocation(`${nextCoords.latitude.toFixed(4)}, ${nextCoords.longitude.toFixed(4)}`);
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError('Unable to detect location. Please allow location access or search manually.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationInput = (value) => {
    setLocation(value);
    setShowSuggestions(true);
  };

  const selectLocation = (suggestion) => {
    setLocation(suggestion.displayName || [suggestion.name, suggestion.admin1, suggestion.country].filter(Boolean).join(', '));
    setCoords({ latitude: suggestion.latitude, longitude: suggestion.longitude });
    setShowSuggestions(false);
  };

  const stopCamera = () => {
    stopStream(cameraStream);
    setCameraStream(null);
    setCameraState('idle');
    setDetectedType(null);
    setCameraError('');
  };

  const startCamera = async () => {
    setCameraError('');
    stopStream(cameraStream);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported by your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraState('active');
    } catch {
      setCameraError('Unable to access the camera. Please allow permission or use a supported device.');
      setCameraState('idle');
    }
  };

  const simulateDetection = async () => {
    if (!videoRef.current) return;

    setCameraState('analyzing');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Unable to read camera frame.');
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);
      const weather = await fetchWeather(coords).catch(() => undefined);
      const prediction = await predictSkinType(imageBase64, weather);
      const predictedType = Math.min(6, Math.max(1, Number(prediction.skin_type || 3)));
      const predictedSafeTime = prediction.safe_time ?? prediction.duration_minutes;

      setDetectedType(predictedType);
      setSkinType(predictedType);
      setMlSafeTime(predictedSafeTime !== undefined && predictedSafeTime !== null ? `${predictedSafeTime} mins` : null);
      setMlRiskLevel(prediction.risk_level || null);
      setCameraState('detected');
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : 'Unable to detect skin type.'
      );
      setCameraState('active');
    }

  };

  const retakePhoto = async () => {
    stopStream(cameraStream);
    setCameraStream(null);
    setDetectedType(null);
    setCameraState('idle');

    setTimeout(() => {
      startCamera();
    }, 150);
  };

  useEffect(() => {
    if (!videoRef.current || !cameraStream) return;
    videoRef.current.srcObject = cameraStream;
    return () => stopStream(cameraStream);
  }, [cameraStream]);

  useEffect(() => {
    if (detectMode !== 'camera') {
      stopCamera();
    }
  }, [detectMode]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setUserName('guest');
      handleUseMyLocation();
      return;
    }

    fetchProfile()
      .then((profile) => {
        setUserName(profile.name || profile.email.split('@')[0]);
        setSkinType(profile.skinType || 3);
      })
      .catch(() => {
        const stored = getStoredUser();
        if (stored) {
          setUserName(stored.name || stored.email.split('@')[0]);
          setSkinType(stored.skinType || 3);
        }
      });

    handleUseMyLocation();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const suggestions = await searchLocations(location);
      setLocationSuggestions(suggestions);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [location]);

  const isCtaDisabled = loading || (detectMode === 'camera' && cameraState !== 'detected');
  const isNightTime = Boolean(uvData && uvData.index <= 0);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl text-left mb-6">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-black text-slate-800">
          Hi, {userName}
        </motion.h2>
        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-slate-500 font-bold">
          Ready to check your sun risk today?
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl shadow-orange-900/5 border border-white mb-8"
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" /> Your Location
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={location} onChange={(e) => handleLocationInput(e.target.value)} onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50/50 border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all text-slate-700 font-medium text-lg placeholder:text-slate-400"
                  placeholder="Enter city or region"
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onMouseDown={() => selectLocation(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors"
                      >
                        <span className="block font-bold text-slate-800">{suggestion.name}</span>
                        <span className="text-sm text-slate-500">{suggestion.displayName || [suggestion.admin1, suggestion.country].filter(Boolean).join(', ')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleUseMyLocation} className="w-14 sm:w-auto px-0 sm:px-4 py-4 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors border-2 border-orange-100 font-bold flex items-center justify-center gap-2 shrink-0">
                <Navigation className={`w-5 h-5 ${locationLoading ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{locationLoading ? 'Locating' : 'Locate'}</span>
              </button>
            </div>
            {locationError && <p className="text-sm font-bold text-red-500">{locationError}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-orange-500" /> Skin Tone Detection
              </label>
            </div>

            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl relative">
              {['manual', 'camera'].map((mode) => (
                <button
                  key={mode} onClick={() => setDetectMode(mode)}
                  className={`flex-1 py-3 text-sm md:text-base font-bold capitalize rounded-xl relative z-10 transition-colors ${detectMode === mode ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <span className="relative z-20 flex items-center justify-center gap-2">
                    {mode === 'camera' && <Sparkles className="w-4 h-4" />} {mode}
                  </span>
                  {detectMode === mode && <motion.div layoutId="activeModeTab" className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl shadow-md" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                </button>
              ))}
            </div>

            <div className="min-h-[120px] sm:min-h-[140px] relative">
              <AnimatePresence mode="wait">
                {detectMode === 'manual' ? (
                  <motion.div key="manual-view" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex justify-between items-center gap-2 md:gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-100">
                    {skinTypes.map((type) => (
                      <button
                        key={type.id} onClick={() => setSkinType(type.id)}
                        className={`relative w-full aspect-square md:aspect-auto md:h-20 rounded-2xl transition-all duration-300 border-2 ${type.color} ${type.border} ${skinType === type.id ? 'ring-4 ring-orange-400 ring-offset-2 scale-110 shadow-lg z-10' : 'hover:scale-105 hover:shadow-md opacity-90 hover:opacity-100'}`}
                      >
                        <span className={`absolute inset-0 flex items-center justify-center font-black text-lg md:text-xl ${[5, 6].includes(type.id) ? 'text-white/90' : 'text-slate-800/70'}`}>{type.label}</span>
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="camera-view" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 md:p-6 w-full relative overflow-hidden flex flex-col justify-center items-center min-h-[260px]">
                    {cameraState === 'idle' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4 text-center">
                        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center shadow-inner mb-2"><Camera className="w-8 h-8" /></div>
                        <p className="font-bold text-slate-600 text-sm max-w-[200px]">Enable camera to accurately detect your skin tone</p>
                        <button onClick={startCamera} className="px-6 py-3 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-bold shadow-sm active:scale-95">Start Camera</button>
                        {cameraError && <p className="text-sm text-red-500 mt-2">{cameraError}</p>}
                      </motion.div>
                    )}
                    {cameraState === 'active' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm aspect-[4/3] bg-slate-900 rounded-2xl relative overflow-hidden shadow-xl">
                        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-orange-400" /><span className="text-white text-xs font-bold uppercase tracking-wider">AI Detection</span>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                          {cameraError && (
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-sm text-red-200 bg-red-500/20 px-3 py-2 rounded-full border border-red-400/40">
                                {cameraError}
                              </p>

                              <button
                                onClick={retakePhoto}
                                className="text-xs font-bold px-3 py-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 transition"
                              >
                                Retake Camera
                              </button>
                            </div>
                          )}
                          <button onClick={simulateDetection} className="relative z-10 w-16 h-16 bg-white rounded-full border-4 border-slate-300 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center group">
                            <div className="w-12 h-12 rounded-full border-2 border-slate-200 group-hover:bg-slate-100 transition-colors" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {cameraState === 'analyzing' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><ScanFace className="w-16 h-16 text-orange-500" /></motion.div>
                        </div>
                        <p className="text-orange-500 font-bold text-lg animate-pulse tracking-wide">Analyzing skin...</p>
                      </motion.div>
                    )}
                    {cameraState === 'detected' && detectedType && (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full max-w-sm space-y-4">
                        <div className="absolute top-4 left-4 bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm z-10">
                          <CheckCircle2 className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wider">Detection Complete</span>
                        </div>
                        <div className="flex gap-6 items-center w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mt-6">
                          <div className={`w-20 h-20 shrink-0 rounded-2xl border-4 shadow-md flex items-center justify-center ${skinTypes.find(t => t.id === detectedType)?.color} ${skinTypes.find(t => t.id === detectedType)?.border}`}>
                            <span className={`text-2xl font-black ${[5, 6].includes(detectedType) ? 'text-white/90' : 'text-slate-800/70'}`}>{skinTypes.find(t => t.id === detectedType)?.label}</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-black text-xl text-slate-800">Skin Type {skinTypes.find(t => t.id === detectedType)?.label}</p>
                            <p className="text-slate-500 text-sm font-medium leading-tight mt-1">{skinTypes.find(t => t.id === detectedType)?.desc}</p>
                          </div>
                        </div>
                        <button onClick={retakePhoto} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm px-5 py-2.5 bg-slate-100 rounded-xl transition-colors"><RefreshCw className="w-4 h-4" /> Retake Photo</button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="sticky bottom-4 z-40 -mx-4 px-4 pt-4 pb-2 md:static md:mx-0 md:px-0 md:pt-0 md:pb-0">
            <button onClick={handleCheckUV} disabled={isCtaDisabled} className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black text-xl shadow-xl shadow-orange-500/30 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale-[0.5] flex items-center justify-center gap-3">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Sun className="w-6 h-6" /></motion.div> : <>{detectMode === 'camera' ? <Camera className="w-6 h-6" /> : <Sun className="w-6 h-6" />} {detectMode === 'camera' ? 'Detect & Check UV' : 'Check UV Risk'}</>}
            </button>
            {error && <p className="mt-3 text-center text-sm font-bold text-red-500">{error}</p>}
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-[300px] flex flex-col items-center justify-center space-y-6">
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-300 to-orange-500 flex items-center justify-center shadow-2xl"><Sun className="w-12 h-12 text-white" /></motion.div>
              <p className="text-orange-500 font-bold text-lg tracking-widest uppercase animate-pulse">Analyzing Atmosphere...</p>
            </motion.div>
          ) : showResults && uvData && weatherData ? (
            <motion.div key="results" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className={`relative overflow-hidden bg-gradient-to-br ${uvData.gradient} rounded-[32px] p-8 text-white shadow-2xl border border-white/20 flex flex-col`}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="absolute -top-20 -right-20 opacity-20 mix-blend-overlay pointer-events-none"><Sun className="w-64 h-64 text-white" /></motion.div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-white/90 font-black uppercase tracking-widest text-sm mb-2 opacity-80">UV Index Level</h3>
                      <span className="text-8xl md:text-9xl font-black tracking-tighter leading-none">{uvData.index}</span>
                    </div>
                    <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-2xl font-black text-lg border border-white/30 uppercase">{uvData.risk}</div>
                  </div>

                  <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden mb-6 relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((uvData.index / 11) * 100, 100)}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute top-0 left-0 h-full bg-white rounded-full" />
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-4 border border-white/20 flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl"><ShieldCheck className="w-8 h-8" /></div>
                    <div>
                      <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">
                        {isNightTime ? 'Night Time' : 'Max Safe Time Before Burn'}
                      </p>
                      <p className="text-2xl font-black">
                        {isNightTime ? 'UV exposure is minimal now' : (mlSafeTime || uvData.safeTime)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-sm font-bold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-yellow-300" /> Recommendation</p>
                    <ul className="text-sm font-medium space-y-1.5 opacity-90 pl-6 list-disc">
                      {isNightTime ? (
                        <li>It is currently night or UV levels are near zero at this location.</li>
                      ) : (
                        <>
                          {uvData.index >= 6 && <li>Avoid sun exposure between 10 AM and 4 PM.</li>}
                          <li>Apply Broad Spectrum SPF 30+ sunscreen.</li>
                          <li>Reapply sunscreen every 2 hours.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border border-white flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2"><Cloud className="w-6 h-6 text-slate-400" /> Current Conditions</h3>
                {weatherMeta && (
                  <div className="mb-5 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-900/10">
                    <div className="mb-3 flex items-center gap-2 text-lg font-black">
                      <MapPin className="h-5 w-5" />
                      <span className="truncate">{checkedLocation}</span>
                    </div>
                    <div className="space-y-2">
                      {getRealtimeRows(weatherMeta).map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl bg-white/15 px-3 py-3 font-black">
                          <span>{row.label}</span>
                          <span className="text-right">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 flex flex-col justify-between group hover:bg-orange-50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500"><Sun className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-slate-500 uppercase">Temp</p>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{weatherData.temp}<span className="text-2xl text-slate-400"> C</span></p>
                  </div>
                  <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100 flex flex-col justify-between group hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500"><Droplets className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-slate-500 uppercase">Humid</p>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{weatherData.humidity}<span className="text-2xl text-slate-400">%</span></p>
                  </div>
                  <div className="bg-teal-50/50 rounded-3xl p-5 border border-teal-100 flex flex-col justify-between group hover:bg-teal-50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-500"><Wind className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-slate-500 uppercase">Wind</p>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{weatherData.wind} <span className="text-lg text-slate-400">km/h</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col justify-between group hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500"><Cloud className="w-6 h-6" /></div>
                      <p className="text-sm font-bold text-slate-500 uppercase">Cloud</p>
                    </div>
                    <p className="text-4xl font-black text-slate-800">{weatherData.cloud}<span className="text-2xl text-slate-400">%</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

    </div>
  );
}
