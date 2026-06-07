import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EyeToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function EyeToggle({ visible, onToggle }: EyeToggleProps) {
  return (
    <Pressable onPress={onToggle} className="p-1" hitSlop={8}>
      <Ionicons
        name={visible ? 'eye-off-outline' : 'eye-outline'}
        size={20}
        color="#737686"
      />
    </Pressable>
  );
}
