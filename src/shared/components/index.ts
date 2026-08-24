// App-wide composed components (Header, Footer, ParticleField, LoadingScreen).
export { Header } from './Header';
export { Footer } from './Footer';
export { ParticleField, type ParticleFieldProps } from './ParticleField';
export { LoadingScreen, type LoadingScreenProps } from './LoadingScreen';
export { ErrorState, type ErrorStateProps } from './ErrorState';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { AppHeader, type AppNavItem, type AppHeaderUser, type ProfileMenuItem } from './AppHeader';
export { AuthModal, type AuthModalProps } from './AuthModal';
export {
  LocationPicker,
  type LocationPickerProps,
  LOCATION_COPY,
  readRecentCities,
  rememberCity,
} from './LocationPicker';
