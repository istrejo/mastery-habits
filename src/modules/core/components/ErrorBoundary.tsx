import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { Button } from './Button';

declare const __DEV__: boolean | undefined;

const isDev = (): boolean => {
  if (typeof __DEV__ !== 'undefined') return __DEV__;
  return process.env.NODE_ENV !== 'production';
};

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    if (isDev()) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] caught', error, info);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
  }
}

const ErrorFallback: React.FC<{ error: Error | null; onRetry: () => void }> = ({ error, onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg.base,
        paddingHorizontal: theme.spacing.stackLg,
        paddingTop: theme.spacing.stackLg,
      }}
    >
      <ScrollView>
        <Text
          style={{
            color: theme.status.danger,
            fontFamily: 'Anton_400Regular',
            fontSize: theme.typography.scale.titleLg.fontSize,
            textTransform: 'uppercase',
            letterSpacing: theme.typography.scale.titleLg.letterSpacing,
            marginBottom: theme.spacing.stackMd,
          }}
        >
          {t('errors.boundary_title')}
        </Text>

        <Text
          style={{
            color: theme.text.secondary,
            fontFamily: 'Lexend_400Regular',
            fontSize: theme.typography.scale.bodyMain.fontSize,
            lineHeight: theme.typography.scale.bodyMain.lineHeight,
            marginBottom: theme.spacing.stackLg,
          }}
        >
          {t('errors.boundary_message')}
        </Text>

        {error && isDev() ? (
          <View
            style={{
              backgroundColor: theme.bg.surfaceAlt,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.stackMd,
              marginBottom: theme.spacing.stackLg,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.border.default,
            }}
          >
            <Text
              style={{
                color: theme.text.primary,
                fontFamily: 'Lexend_400Regular',
                fontSize: 12,
              }}
            >
              {error.message}
            </Text>
          </View>
        ) : null}

        <Button label={t('errors.boundary_reload')} onPress={onRetry} />
        <View style={{ height: theme.spacing.stackLg }} />
      </ScrollView>
    </View>
  );
};
