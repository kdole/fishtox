import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LatLngBounds } from 'leaflet';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSpecies = searchParams.get('species')?.split(',').filter(Boolean) || [];
  
  const mapBounds: MapBounds | null = (() => {
    const boundsParam = searchParams.get('bounds');
    if (!boundsParam) return null;
    
    try {
      const [north, south, east, west] = boundsParam.split(',').map(Number);
      if ([north, south, east, west].some(isNaN)) return null;
      return { north, south, east, west };
    } catch {
      return null;
    }
  })();

  const setSelectedSpecies = useCallback((species: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (species.length > 0) {
      newParams.set('species', species.join(','));
    } else {
      newParams.delete('species');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const setMapBounds = useCallback((bounds: LatLngBounds | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (bounds) {
      const boundsString = [
        bounds.getNorth().toFixed(6),
        bounds.getSouth().toFixed(6),
        bounds.getEast().toFixed(6),
        bounds.getWest().toFixed(6)
      ].join(',');
      newParams.set('bounds', boundsString);
    } else {
      newParams.delete('bounds');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    selectedSpecies,
    setSelectedSpecies,
    mapBounds,
    setMapBounds,
  };
};