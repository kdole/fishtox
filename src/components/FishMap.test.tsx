import React from 'react';
import { render, screen } from '@testing-library/react';
import { FishMap } from './FishMap';
import { FishSample } from '../types/fish';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom }: any) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ center }: any) => (
    <div data-testid="circle-marker" data-center={JSON.stringify(center)} />
  ),
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({
    fitBounds: jest.fn(),
    getBounds: jest.fn(() => ({
      getNorth: () => 37.5,
      getSouth: () => 37.4,
      getEast: () => -122.0,
      getWest: () => -122.2,
    })),
  }),
  useMapEvents: () => ({
    getBounds: jest.fn(() => ({
      getNorth: () => 37.5,
      getSouth: () => 37.4,
      getEast: () => -122.0,
      getWest: () => -122.2,
    })),
  }),
}));

describe('FishMap', () => {
  const mockOnBoundsChange = jest.fn();
  const mockOnUserAdjustedMap = jest.fn();

  beforeEach(() => {
    mockOnBoundsChange.mockClear();
    mockOnUserAdjustedMap.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <FishMap
        data={[]}
        selectedSpecies={[]}
        onBoundsChange={mockOnBoundsChange}
        userHasAdjustedMap={false}
        onUserAdjustedMap={mockOnUserAdjustedMap}
      />,
    );
    expect(screen.getByText('Sample Locations')).toBeInTheDocument();
  });

  it('handles empty data with default California center', () => {
    render(
      <FishMap
        data={[]}
        selectedSpecies={[]}
        onBoundsChange={mockOnBoundsChange}
        userHasAdjustedMap={false}
        onUserAdjustedMap={mockOnUserAdjustedMap}
      />,
    );
    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    expect(center).toEqual([37.0, -119.5]);
  });

  it('handles data with different coordinates', () => {
    const testData: FishSample[] = [
      {
        species: 'Bass',
        mercuryPpm: 0.5,
        lengthMm: 300,
        latitude: 37.5,
        longitude: -122.1,
      },
      {
        species: 'Bass',
        mercuryPpm: 0.6,
        lengthMm: 350,
        latitude: 37.6,
        longitude: -122.2,
      },
    ];

    render(
      <FishMap
        data={testData}
        selectedSpecies={['Bass']}
        onBoundsChange={mockOnBoundsChange}
        userHasAdjustedMap={false}
        onUserAdjustedMap={mockOnUserAdjustedMap}
      />,
    );

    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    // With hardcoded bounds, center is always California center
    expect(center).toEqual([37.0, -119.5]);
    expect(screen.getAllByTestId('circle-marker')).toHaveLength(2);
  });

  it('handles all data points at identical coordinates (anchovy scenario)', () => {
    const identicalLocationData: FishSample[] = [
      {
        species: 'Anchovy',
        mercuryPpm: 0.075,
        lengthMm: 102.5,
        latitude: 37.4996,
        longitude: -122.125,
      },
      {
        species: 'Anchovy',
        mercuryPpm: 0.075,
        lengthMm: 102.5,
        latitude: 37.4996,
        longitude: -122.125,
      },
      {
        species: 'Anchovy',
        mercuryPpm: 0.075,
        lengthMm: 102.5,
        latitude: 37.4996,
        longitude: -122.125,
      },
    ];

    render(
      <FishMap
        data={identicalLocationData}
        selectedSpecies={['Anchovy']}
        onBoundsChange={mockOnBoundsChange}
        userHasAdjustedMap={false}
        onUserAdjustedMap={mockOnUserAdjustedMap}
      />,
    );

    // Should render without errors
    expect(screen.getByText('Sample Locations')).toBeInTheDocument();

    // With hardcoded bounds, center is always California center
    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    expect(center).toEqual([37.0, -119.5]);

    // Should have a default zoom level
    expect(mapContainer.getAttribute('data-zoom')).toBe('6');

    // All markers should be rendered
    expect(screen.getAllByTestId('circle-marker')).toHaveLength(3);
  });

  it('displays selected species chips', () => {
    const testData: FishSample[] = [
      {
        species: 'Bass',
        mercuryPpm: 0.5,
        lengthMm: 300,
        latitude: 37.5,
        longitude: -122.1,
      },
    ];

    render(
      <FishMap
        data={testData}
        selectedSpecies={['Bass', 'Trout']}
        onBoundsChange={mockOnBoundsChange}
        userHasAdjustedMap={false}
        onUserAdjustedMap={mockOnUserAdjustedMap}
      />,
    );

    expect(screen.getByText('Bass')).toBeInTheDocument();
    expect(screen.getByText('Trout')).toBeInTheDocument();
  });
});
