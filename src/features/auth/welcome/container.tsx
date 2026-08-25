import { LoadingScreen } from '@shared/components';
import { useWelcome } from './hooks';
import { Component } from './Component';

export function WelcomeContainer() {
  const w = useWelcome();
  // /welcome is a standalone route with no shell behind it, so the full-bleed
  // splash is right here — unlike the screens inside a layout.
  if (!w.ready) return <LoadingScreen message="Getting things ready…" inline={false} />;
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
