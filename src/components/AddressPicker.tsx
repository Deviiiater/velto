'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-accent animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

type AddressPickerProps = {
  onAddressConfirmed: (address: string) => void;
};

export function AddressPicker({ onAddressConfirmed }: AddressPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [customAddress, setCustomAddress] = useState('');

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // In a real app, you'd use a Reverse Geocoding API (like Nominatim) here to get the street address.
    // For MVP, we auto-fill coordinates and let the user type their specific door number.
    setCustomAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  const handleConfirm = () => {
    if (customAddress.trim() !== '') {
      onAddressConfirmed(customAddress);
    }
  };

  return (
    <div className="flex flex-col gap-4 border border-border p-4 rounded-xl bg-card">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <MapPin size={20} className="text-primary"/> Pin Your Location
      </h3>
      
      <div className="relative border border-border rounded-lg overflow-hidden">
        <MapWithNoSSR onLocationSelect={handleLocationSelect} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Complete Address Details</label>
        <textarea 
          value={customAddress}
          onChange={(e) => setCustomAddress(e.target.value)}
          placeholder="House/Flat No., Building Name, Landmark..."
          className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-24"
        />
      </div>

      <button 
        onClick={handleConfirm}
        disabled={!customAddress}
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
      >
        Confirm Location
      </button>
    </div>
  );
}
