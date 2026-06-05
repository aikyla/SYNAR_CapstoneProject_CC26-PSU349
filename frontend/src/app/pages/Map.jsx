import { useEffect, useState } from "react";
import { Info, LocateFixed, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getUVData } from "../utils";
import { fetchWeather, reverseGeocode } from "../services/synarService";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const defaultCoords = {
  latitude: -6.2088,
  longitude: 106.8456,
};

const riskLegend = [
  {
    key: "Low",
    label: "Low",
    range: "UV 0-2",
    color: "bg-green-400",
    text: "text-green-600",
    border: "border-green-200",
    guidance: "Low risk. Basic sunscreen is enough for longer outdoor time.",
  },
  {
    key: "Moderate",
    label: "Moderate",
    range: "UV 3-5",
    color: "bg-yellow-400",
    text: "text-yellow-600",
    border: "border-yellow-200",
    guidance: "Moderate risk. Use SPF 30+ and seek shade during midday.",
  },
  {
    key: "High",
    label: "High",
    range: "UV 6-7",
    color: "bg-orange-500",
    text: "text-orange-600",
    border: "border-orange-200",
    guidance: "High risk. Reapply sunscreen and reduce direct sun exposure.",
  },
  {
    key: "Extreme",
    label: "Extreme",
    range: "UV 8+",
    color: "bg-red-500",
    text: "text-red-600",
    border: "border-red-200",
    guidance: "Extreme risk. Avoid direct sun whenever possible.",
  },
];

function ChangeMapView({ coords }) {
  const map = useMap();

  useEffect(() => {
    map.setView([coords.latitude, coords.longitude], 12);
  }, [coords, map]);

  return null;
}

function RecenterButton({ coords }) {
  const map = useMap();

  return (
    <button
      onClick={() => map.setView([coords.latitude, coords.longitude], 13)}
      className="absolute right-4 top-4 z-[400] w-11 h-11 rounded-xl bg-white text-orange-500 border border-slate-200 shadow-lg hover:bg-orange-50 flex items-center justify-center"
      aria-label="Back to my location"
    >
      <LocateFixed className="w-5 h-5" />
    </button>
  );
}

export default function MapPage() {
  const [coords, setCoords] = useState(defaultCoords);
  const [locationName, setLocationName] = useState("Jakarta, Indonesia");
  const [uvData, setUvData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [uvLoading, setUvLoading] = useState(true);
  const [uvError, setUvError] = useState("");
  const [selectedRisk, setSelectedRisk] = useState(riskLegend[0]);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setUvError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);
        setLocationName(await reverseGeocode(nextCoords));
      },
      () => setUvError("Unable to detect your location. Showing Jakarta instead."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    locateUser();
  }, []);

  useEffect(() => {
    const loadUv = async () => {
      setUvLoading(true);
      setUvError("");

      try {
        const data = await fetchWeather(coords);
        const nextUvData = getUVData(Math.round(data.uv_index));
        setUvData(nextUvData);
        setSelectedRisk(riskLegend.find((risk) => risk.key === nextUvData.risk) || riskLegend[0]);
        setWeather({
          temp: Math.round(data.temperature),
          humidity: Math.round(data.humidity),
          wind: Math.round(data.wind_speed),
          cloud: Math.round(data.cloud_cover),
        });
      } catch (error) {
        setUvError(error instanceof Error ? error.message : "Unable to load UV data");
      } finally {
        setUvLoading(false);
      }
    };

    loadUv();
  }, [coords.latitude, coords.longitude]);

  const currentRisk = uvData
    ? riskLegend.find((risk) => risk.key === uvData.risk) || riskLegend[0]
    : null;

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Live UV Map</h2>
          <p className="text-slate-500 font-bold">Real-time UV overview near you</p>
        </div>

        <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50" aria-label="Map information">
          <Info className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white min-h-[420px]">
        <MapContainer center={[coords.latitude, coords.longitude]} zoom={12} className="w-full h-full z-0">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeMapView coords={coords} />
          <RecenterButton coords={coords} />
          <Marker position={[coords.latitude, coords.longitude]}>
            <Popup>
              <div className="space-y-1">
                <p className="font-bold">{locationName}</p>
                <p>UV Index: {uvLoading ? "Loading..." : uvData?.index ?? "-"}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white max-w-xs z-[400]">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Current Location
          </h3>
          <p className="text-sm text-slate-500 font-medium">{locationName}</p>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-500 leading-none">{uvLoading ? "-" : uvData?.index ?? "-"}</span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">UV Index</span>
          </div>

          <p className="mt-2 text-xs font-semibold uppercase tracking-wider">
            {uvLoading && "Loading UV data..."}
            {!uvLoading && uvError && <span className="text-red-500">{uvError}</span>}
            {!uvLoading && !uvError && uvData && <span className="text-slate-500">{uvData.risk} risk - Safe time {uvData.safeTime}</span>}
          </p>

          {weather && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
              <span>{weather.temp} C</span>
              <span>{weather.humidity}% humid</span>
              <span>{weather.wind} km/h wind</span>
              <span>{weather.cloud}% cloud</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white z-[400]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Legend</p>
            {currentRisk && (
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${currentRisk.text} ${currentRisk.border} bg-white`}>
                Current: {uvData.risk}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {riskLegend.map((risk) => {
              const isActive = selectedRisk.key === risk.key;
              return (
                <button
                  key={risk.key}
                  type="button"
                  onClick={() => setSelectedRisk(risk)}
                  className={`rounded-xl border p-2 text-left transition-all ${isActive ? `${risk.border} bg-white shadow-md ring-2 ring-slate-900/5` : 'border-slate-100 bg-slate-50 hover:bg-white'}`}
                  aria-pressed={isActive}
                >
                  <span className={`mb-2 block h-2 rounded-full ${risk.color}`} />
                  <span className="block text-[10px] font-black uppercase text-slate-700">{risk.label}</span>
                  <span className="block text-[10px] font-bold text-slate-400">{risk.range}</span>
                </button>
              );
            })}
          </div>
          <div className={`mt-3 rounded-xl border bg-white p-3 text-xs font-bold ${selectedRisk.text} ${selectedRisk.border}`}>
            {selectedRisk.guidance}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
