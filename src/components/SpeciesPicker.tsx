import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface SpeciesPickerProps {
  species: string[];
  selectedSpecies: string[];
  onSpeciesChange: (species: string[]) => void;
}

export const SpeciesPicker: React.FC<SpeciesPickerProps> = ({
  species,
  selectedSpecies,
  onSpeciesChange,
}) => {
  return (
    <Autocomplete
      multiple
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
          option.toLowerCase().includes(input),
        );
      }}
      openOnFocus
      clearOnBlur={false}
      ChipProps={{
        size: 'small',
        sx: { fontSize: '0.875rem' },
      }}
    />
  );
};
