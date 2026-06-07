import { Pressable, View } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onToggle, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`w-6 h-6 rounded-md border-2 items-center justify-center active:opacity-70 ${
        checked ? "bg-primary-500 border-primary-500" : "border-gray-300"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {checked && (
        <View className="w-3 h-2 border-b-2 border-l-2 border-white -rotate-45 mb-0.5" />
      )}
    </Pressable>
  );
}
