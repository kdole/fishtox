import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSpecies = searchParams.get('species')?.split(',').filter(Boolean) || [];

  const setSelectedSpecies = useCallback((species: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (species.length > 0) {
      newParams.set('species', species.join(','));
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