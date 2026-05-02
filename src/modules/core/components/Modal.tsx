import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@core/theming';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  style,
}) => {
  const t = useTheme();
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            {
              backgroundColor: t.bg.elevated,
              borderColor: t.border.default,
              borderWidth: t.borderWidth.default,
              borderRadius: t.radius.lg,
              padding: 24,
              width: '88%',
              maxWidth: 400,
            },
            style,
          ]}
        >
          {title ? (
            <Text
              style={{
                color: t.text.primary,
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 16,
              }}
            >
              {title}
            </Text>
          ) : null}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};
