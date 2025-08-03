import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { useUrlState } from './useUrlState';
import React from 'react';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

// Mock Leaflet LatLngBounds
const mockLatLngBounds = (north: number, east: number, south: number, west: number) => ({
  getNorth: () => north,
  getSouth: () => south,
  getEast: () => east,
  getWest: () => west,
});

describe('useUrlState', () => {
  let mockSearchParams: URLSearchParams;
  let mockSetSearchParams: jest.Mock;

  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockSetSearchParams = jest.fn((newParams) => {
      // Update mockSearchParams to simulate React Router behavior
      mockSearchParams = new URLSearchParams(newParams);
      // Update the mock return value to reflect the new state
      (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams, mockSetSearchParams]);
    });
    
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams, mockSetSearchParams]);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </MemoryRouter>
  );

  describe('selectedSpecies', () => {
    it('should return empty array when no species in URL', () => {
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.selectedSpecies).toEqual([]);
    });

    it('should parse single species from URL', () => {
      mockSearchParams.set('species', 'Bass: Largemouth');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.selectedSpecies).toEqual(['Bass: Largemouth']);
    });

    it('should parse multiple species from URL', () => {
      mockSearchParams.set('species', 'Bass: Largemouth,Trout: Rainbow,Catfish: Channel');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.selectedSpecies).toEqual([
        'Bass: Largemouth',
        'Trout: Rainbow',
        'Catfish: Channel',
      ]);
    });

    it('should handle encoded species names', () => {
      mockSearchParams.set('species', 'Shark:%20Blue%20(juvenile)');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      // URLSearchParams doesn't automatically decode %20 to space
      expect(result.current.selectedSpecies).toEqual(['Shark:%20Blue%20(juvenile)']);
    });

    it('should update URL when setting species', () => {
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        result.current.setSelectedSpecies(['Bass: Largemouth', 'Trout: Rainbow']);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams));
      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.get('species')).toBe('Bass: Largemouth,Trout: Rainbow');
    });

    it('should remove species param when setting empty array', () => {
      mockSearchParams.set('species', 'Bass: Largemouth');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        result.current.setSelectedSpecies([]);
      });

      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.has('species')).toBe(false);
    });

    it('should preserve other URL params when updating species', () => {
      mockSearchParams.set('otherParam', 'value');
      mockSearchParams.set('species', 'Bass: Largemouth');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        result.current.setSelectedSpecies(['Trout: Rainbow']);
      });

      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.get('species')).toBe('Trout: Rainbow');
      expect(newParams.get('otherParam')).toBe('value');
    });
  });

  describe('mapBounds', () => {
    it('should return null when no bounds in URL', () => {
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toBeNull();
    });

    it('should parse valid bounds from URL', () => {
      mockSearchParams.set('bounds', '38.5,37.5,-121.5,-122.5');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toEqual({
        north: 38.5,
        south: 37.5,
        east: -121.5,
        west: -122.5,
      });
    });

    it('should handle bounds with positive longitudes', () => {
      mockSearchParams.set('bounds', '36.0,35.0,119.0,118.0');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toEqual({
        north: 36.0,
        south: 35.0,
        east: 119.0,
        west: 118.0,
      });
    });

    it('should return null for invalid bounds format', () => {
      mockSearchParams.set('bounds', 'invalid');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toBeNull();
    });

    it('should return null for bounds with wrong number of values', () => {
      mockSearchParams.set('bounds', '37.5,-122.5,38.5');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toBeNull();
    });

    it('should return null for bounds with non-numeric values', () => {
      mockSearchParams.set('bounds', '37.5,abc,38.5,-121.5');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toBeNull();
    });

    it('should update URL when setting bounds', () => {
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        const bounds = mockLatLngBounds(37.0, -122.0, 36.0, -123.0) as any;
        result.current.setMapBounds(bounds);
      });

      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.get('bounds')).toBe('37.000000,36.000000,-122.000000,-123.000000');
    });

    it('should remove bounds param when setting null', () => {
      mockSearchParams.set('bounds', '37.5,-122.5,38.5,-121.5');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        result.current.setMapBounds(null);
      });

      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.has('bounds')).toBe(false);
    });

    it('should preserve other URL params when updating bounds', () => {
      mockSearchParams.set('species', 'Bass: Largemouth');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      act(() => {
        const bounds = mockLatLngBounds(37.0, -122.0, 36.0, -123.0) as any;
        result.current.setMapBounds(bounds);
      });

      const newParams = mockSetSearchParams.mock.calls[0][0];
      expect(newParams.get('bounds')).toBe('37.000000,36.000000,-122.000000,-123.000000');
      expect(newParams.get('species')).toBe('Bass: Largemouth');
    });

    it('should handle bounds at extreme coordinates', () => {
      mockSearchParams.set('bounds', '90,-90,180,-180');
      const { result } = renderHook(() => useUrlState(), { wrapper });

      expect(result.current.mapBounds).toEqual({
        north: 90,
        south: -90,
        east: 180,
        west: -180,
      });
    });
  });

  describe('combined operations', () => {
    it('should handle both species and bounds functions exist', () => {
      const { result } = renderHook(() => useUrlState(), { wrapper });

      // Just verify both functions exist and can be called
      expect(typeof result.current.setSelectedSpecies).toBe('function');
      expect(typeof result.current.setMapBounds).toBe('function');
      
      // Test they can be called without errors
      act(() => {
        result.current.setSelectedSpecies(['Bass: Largemouth']);
      });

      act(() => {
        const bounds = mockLatLngBounds(37.0, -122.0, 36.0, -123.0) as any;
        result.current.setMapBounds(bounds);
      });

      // Verify both operations completed
      expect(mockSetSearchParams).toHaveBeenCalledTimes(2);
    });
  });
});