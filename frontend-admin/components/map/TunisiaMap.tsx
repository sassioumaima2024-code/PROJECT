import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TunisiaMapProps {
  onGovernorateClick: (govName: string) => void;
}

export default function TunisiaMap({ onGovernorateClick }: TunisiaMapProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // Fetch GeoJSON data for Tunisia governorates
    fetch('https://raw.githubusercontent.com/riatelab/tunisie/master/data/TN-gouvernorats.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading GeoJSON:", err));
  }, []);

  if (!geoData) {
    return <div className="h-[500px] w-full flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 font-medium">Chargement de la carte...</div>;
  }

  const onEachFeature = (feature: any, layer: any) => {
    const govName = feature.properties.gouv_fr || feature.properties.gov_name_f || feature.properties.NAME_1 || feature.properties.name || "Gouvernorat";
    
    layer.bindTooltip(govName, {
      permanent: true,
      direction: 'center',
      className: 'bg-transparent text-primary/80 font-black px-1 py-0 shadow-none border-none text-[8px] sm:text-[10px] leading-tight text-center drop-shadow-md'
    });

    layer.on({
      click: () => {
        onGovernorateClick(govName);
      },
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 2,
          color: '#14b8a6', // teal-500
          fillOpacity: 0.8
        });
        target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle({
          weight: 1,
          color: '#ffffff',
          fillOpacity: 0.5
        });
      }
    });
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-inner border border-slate-100">
      <MapContainer 
        center={[33.8869, 9.5375]} 
        zoom={6} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON 
          data={geoData} 
          onEachFeature={onEachFeature}
          style={() => ({
            fillColor: '#9B1D54', // primary color
            weight: 1,
            opacity: 1,
            color: '#ffffff',
            fillOpacity: 0.5
          })}
        />
      </MapContainer>
    </div>
  );
}
