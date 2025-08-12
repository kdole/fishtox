import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props: Record<string, string | number> }) => void;
  }
}

function sendToPlausible(metric: Metric): void {
  if (window.plausible) {
    window.plausible('Web Vital', {
      props: {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_rating: metric.rating || 'unknown',
      },
    });
  }
}

export function initializeWebVitals(): void {
  // Only initialize web vitals in browser environment with proper Performance API
  if (typeof window === 'undefined' ||
      !window.performance ||
      typeof window.performance.getEntriesByType !== 'function' ||
      process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    onCLS(sendToPlausible);
    onINP(sendToPlausible);
    onFCP(sendToPlausible);
    onLCP(sendToPlausible);
    onTTFB(sendToPlausible);
  } catch (error) {
    // Silently fail if web vitals can't be initialized
    console.warn('Web vitals could not be initialized:', error);
  }
}
