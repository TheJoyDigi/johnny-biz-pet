import { useState, KeyboardEvent } from 'react';
import { usePlacesWidget } from 'react-google-autocomplete';
import { FaSearch, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';

interface SitterSearchProps {
  onSearch: (lat: number, lng: number) => void;
  isLoading: boolean;
}

export default function SitterSearch({ onSearch, isLoading }: SitterSearchProps) {
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const { ref: inputRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setAddress(place.formatted_address || '');
        onSearch(lat, lng);
      }
    },
    options: {
      types: ['(cities)'],
      componentRestrictions: { country: 'us' },
    },
  });

  const handleManualSearch = async () => {
    if (!address.trim()) return;

    // Use Google Geocoding API to resolve the input text
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            const formattedAddress = data.results[0].formatted_address;
            
            // Update address to show user what was matched
            setAddress(formattedAddress);
            if (inputRef.current) {
                inputRef.current.value = formattedAddress;
                inputRef.current.blur(); // Close dropdown
            }
            
            onSearch(lat, lng);
        } else {
            console.warn("Geocoding failed or found no results for:", address);
            // Optionally show error to user
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleManualSearch();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get city name
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
                const data = await response.json();
                
                if (data.status === 'OK' && data.results[0]) {
                    const formatted = data.results[0].formatted_address;
                    setAddress(formatted);
                    if (inputRef.current) {
                        inputRef.current.value = formatted;
                    }
                }
            } catch (error) {
                console.error("Reverse geocoding failed", error);
            }
            
            onSearch(latitude, longitude);
            setIsLocating(false);
        },
        (error) => {
            console.error("Geolocation error:", error);
            setIsLocating(false);
            alert("Unable to retrieve your location");
        }
    );
  };

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-100 p-2">
        <div className="pl-4 text-gray-400">
          <FaMapMarkerAlt className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
          placeholder="Enter your city"
          defaultValue={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        {/* Current Location Button */}
        <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="p-2 mr-2 text-gray-400 hover:text-[#1A9CB0] transition-colors"
            title="Use my current location"
            disabled={isLocating || isLoading}
        >
            {isLocating ? (
                <div className="w-5 h-5 border-2 border-[#1A9CB0] border-t-transparent rounded-full animate-spin" />
            ) : (
                <FaLocationArrow className="w-5 h-5" />
            )}
        </button>

        <button
          className="bg-[#1A9CB0] text-white p-3 rounded-full hover:bg-[#157c8d] transition-colors disabled:opacity-50"
          disabled={isLoading || isLocating}
          onClick={handleManualSearch}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaSearch className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">
        Find verified sitters near you (currently supporting Irvine & Wildomar areas)
      </p>
    </div>
  );
}
