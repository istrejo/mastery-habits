import { Pressable, Text, View } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "dark";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary rounded px-6 py-3 items-center active:opacity-80",
    text: "text-on-primary font-semibold text-label-md uppercase tracking-widest",
  },
  secondary: {
    container: "bg-transparent border border-outline rounded px-6 py-3 items-center active:opacity-80",
    text: "text-on-surface font-semibold text-label-md uppercase tracking-widest",
  },
  ghost: {
    container: "bg-transparent px-6 py-3 items-center active:opacity-60",
    text: "text-primary font-semibold text-label-md",
  },
  dark: {
    container: "bg-black rounded px-6 py-3 items-center active:opacity-80",
    text: "text-white font-semibold text-label-md uppercase tracking-widest",
  },
};

export function Button({ label, onPress, variant = "primary", disabled = false, fullWidth = false, icon }: ButtonProps) {
  const classes = variantClasses[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${classes.container} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <View className="flex-row items-center gap-sm">
        {icon}
        <Text className={classes.text}>{label}</Text>
      </View>
    </Pressable>
  );
}
