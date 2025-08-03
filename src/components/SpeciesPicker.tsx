import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface SpeciesPickerProps {
  species: string[];
  selectedSpecies: string | null;
  onSpeciesChange: (species: string | null) => void;
}

export const SpeciesPicker: React.FC<SpeciesPickerProps> = ({
  species,
  selectedSpecies,
  onSpeciesChange,
}) => {
  return (
    <Autocomplete
      value={selectedSpecies}
      onChange={(_, newValue) => onSpeciesChange(newValue)}
      options={species}
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Fish Species"
          placeholder="Type to search species..."
        />
      )}
      filterOptions={(options, state) => {
        if (!state.inputValue) return options;
        const input = state.inputValue.toLowerCase();
        return options.filter(option => 
          option.toLowerCase().includes(input)
        );
      }}
      openOnFocus
      clearOnBlur={false}
      blurOnSelect
    />
  );
};