import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSpecies = searchParams.get('species');

  const setSelectedSpecies = useCallback((species: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (species) {
      newParams.set('species', species);
    } else {
      newParams.delete('species');
    }
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return {
    selectedSpecies,
    setSelectedSpecies,
  };
};