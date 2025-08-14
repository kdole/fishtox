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

  beforeEach(() => {
    mockOnBoundsChange.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <FishMap
        data={[]}
        selectedSpecies={[]}
        onBoundsChange={mockOnBoundsChange}
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
      />,
    );
    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    expect(center).toEqual([36.7783, -119.4179]);
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
      />,
    );

    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    expect(center[0]).toBeCloseTo(37.55, 2);
    expect(center[1]).toBeCloseTo(-122.15, 2);
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
      />,
    );

    // Should render without errors
    expect(screen.getByText('Sample Locations')).toBeInTheDocument();

    // Map should be centered at the single location
    const mapContainer = screen.getByTestId('map-container');
    const center = JSON.parse(mapContainer.getAttribute('data-center') || '[]');
    expect(center[0]).toBeCloseTo(37.4996, 4);
    expect(center[1]).toBeCloseTo(-122.125, 4);

    // Should have a default zoom level
    expect(mapContainer.getAttribute('data-zoom')).toBe('13');

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
      />,
    );

    expect(screen.getByText('Bass')).toBeInTheDocument();
    expect(screen.getByText('Trout')).toBeInTheDocument();
  });
});
