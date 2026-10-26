import { createContext, useContext, useMemo } from 'react';
import { createRsvpService } from './services';

const RsvpServiceContext = createContext(null);

/** Injects the RSVP service. Pass `service` to swap in a custom one (tests, another backend). */
export function RsvpServiceProvider({ service, children }) {
  const value = useMemo(() => service ?? createRsvpService(), [service]);
  return <RsvpServiceContext.Provider value={value}>{children}</RsvpServiceContext.Provider>;
}

export function useRsvpService() {
  const service = useContext(RsvpServiceContext);
  if (!service) throw new Error('useRsvpService must be used inside <RsvpServiceProvider>.');
  return service;
}
