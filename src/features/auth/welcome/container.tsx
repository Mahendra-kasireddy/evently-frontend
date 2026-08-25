import { LoadingScreen } from '@shared/components';
import { useWelcome } from './hooks';
import { Component } from './Component';

export function WelcomeContainer() {
  const w = useWelcome();
  // Inside the customer shell now, so the loader fills the content area and
  // leaves the header in place.
  if (!w.ready) return <LoadingScreen message="Getting things ready…" />;
  return (
    <Component
      step={w.step}
      name={w.name}
      setName={w.setName}
      nameError={w.nameError}
      onSubmitName={w.submitName}
      cities={w.cities}
      citiesLoading={w.citiesLoading}
      recent={w.recent}
      city={w.city}
      onSelectCity={w.selectCity}
      onSkipCity={w.skipCity}
      isSaving={w.isSaving}
      error={w.error}
    />
  );
}

export default WelcomeContainer;
