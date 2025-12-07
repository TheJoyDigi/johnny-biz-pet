import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

interface SimpleSitterFilterProps {
  locations: string[];
  selectedLocation: string | null;
  onSelect: (location: string | null) => void;
}

export default function SimpleSitterFilter({ locations, selectedLocation, onSelect }: SimpleSitterFilterProps) {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Location</h3>
        <div className="flex flex-wrap justify-center gap-3">
            <button
                onClick={() => onSelect(null)}
                className={`px-6 py-2 rounded-full border transition-all duration-200 ${
                    selectedLocation === null
                        ? 'bg-[#1A9CB0] text-white border-[#1A9CB0] shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A9CB0] hover:text-[#1A9CB0]'
                }`}
            >
                All Locations
            </button>
            {locations.sort().map((loc) => (
                <button
                    key={loc}
                    onClick={() => onSelect(loc === selectedLocation ? null : loc)}
                    className={`px-6 py-2 rounded-full border transition-all duration-200 flex items-center gap-2 ${
                        selectedLocation === loc
                            ? 'bg-[#1A9CB0] text-white border-[#1A9CB0] shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A9CB0] hover:text-[#1A9CB0]'
                    }`}
                >
                    <FaMapMarkerAlt className={`w-3 h-3 ${selectedLocation === loc ? 'text-white' : 'text-[#1A9CB0]'}`} />
                    {loc}
                </button>
            ))}
        </div>
      </div>
      
      {/* Search Input Placeholder - optional if we want to search within list but dropdown/chips is better for small data */}
      
      <p className="text-center text-sm text-gray-500 mt-2">
        Browse verified sitters in our key service areas.
      </p>
    </div>
  );
}
