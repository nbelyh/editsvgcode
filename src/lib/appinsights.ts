import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { config } from './config';
import { getConsent } from './cookie-consent';

let appInsights: ApplicationInsights | null = null;

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export function initAppInsights(): void {
  if (isLocalhost || !config.APPINSIGHTS_CONNECTION_STRING || getConsent() !== 'accepted') return;

  appInsights = new ApplicationInsights({
    config: {
      connectionString: config.APPINSIGHTS_CONNECTION_STRING,
      enableAutoRouteTracking: true,
      enableUnhandledPromiseRejectionTracking: true,
      correlationHeaderExcludedDomains: [
        '*.google-analytics.com',
        '*.analytics.google.com',
        '*.carbonads.com',
        '*.carbonads.net',
      ],
      excludeRequestFromAutoTrackingPatterns: [
        /google-analytics\.com/,
        /analytics\.google\.com/,
        /carbonads/,
      ],
    },
  });
  appInsights.loadAppInsights();
  appInsights.addTelemetryInitializer((item) => {
    item.tags = item.tags || [];
    item.tags['ai.cloud.role'] = 'browser';
  });
}

export function trackException(err: unknown, context: string): void {
  if (!appInsights) return;
  const error = err instanceof Error ? err : new Error(String(err));
  appInsights.trackException({
    exception: error,
    properties: { context },
  });
}
