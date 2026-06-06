import { Redirect } from 'expo-router';
import { useSessionStore } from '@core/states/session.store';

export default function HomeScreen() {
  const session = useSessionStore((state) => state.session);

  return <Redirect href={session ? '/(tabs)' : '/(auth)/login'} />;
}
