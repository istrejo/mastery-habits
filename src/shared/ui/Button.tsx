import { Pressable, Text, View } from "react-native";
import { useThemeColors } from "../../core/theme/useThemeColors";

type Variant = "primary" | "secondary" | "ghost" | "dark";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const TEXT_CLASSES: Record<Variant, string> = {
  primary: "text-on-primary font-semibold text-label-md uppercase tracking-widest",
  secondary: "text-on-surface font-semibold text-label-md uppercase tracking-widest",
  ghost: "text-primary font-semibold text-label-md",
  dark: "text-white font-semibold text-label-md uppercase tracking-widest",
};

const CONTAINER_CLASSES: Record<Variant, string> = {
  primary: "rounded px-6 py-3 items-center active:opacity-80",
  secondary: "rounded px-6 py-3 items-center active:opacity-80 border border-outline",
  ghost: "px-6 py-3 items-center active:opacity-60",
  dark: "rounded px-6 py-3 items-center active:opacity-80",
};

export function Button({ label, onPress, variant = "primary", disabled = false, fullWidth = false, icon }: ButtonProps) {
  const themeColors = useThemeColors();
  const backgroundColor =
    variant === "primary"
      ? themeColors["--color-primary"]
      : variant === "dark"
        ? "#000000"
        : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ backgroundColor }}
      className={`${CONTAINER_CLASSES[variant]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <View className="flex-row items-center gap-sm">
        {icon}
        <Text className={TEXT_CLASSES[variant]}>{label}</Text>
      </View>
    </Pressable>
  );
}
