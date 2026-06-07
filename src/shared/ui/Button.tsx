import { Pressable, Text } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary-500 rounded-xl px-6 py-3 items-center active:opacity-80",
    text: "text-white font-semibold text-base",
  },
  secondary: {
    container: "bg-transparent border border-primary-500 rounded-xl px-6 py-3 items-center active:opacity-80",
    text: "text-primary-500 font-semibold text-base",
  },
  ghost: {
    container: "bg-transparent px-6 py-3 items-center active:opacity-60",
    text: "text-primary-500 font-semibold text-base",
  },
};

export function Button({ label, onPress, variant = "primary", disabled = false, fullWidth = false }: ButtonProps) {
  const classes = variantClasses[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${classes.container} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={classes.text}>{label}</Text>
    </Pressable>
  );
}
