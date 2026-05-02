import { Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { useAuth } from "@auth/index";
import { Screen, Input, Button } from "@core/components";
import { useTheme } from "@core/theming";

const schema = z.object({
  displayName: z.string().min(2, "Mínimo 2 caracteres").max(40),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const t = useTheme();
  const { signUp, loading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    signUp(data.email, data.password, data.displayName);
  };

  return (
    <Screen scrollable>
      <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40 }}>
        <Text
          style={{
            color: t.text.primary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 6,
            fontFamily: t.typography.displayFontFamily,
          }}
        >
          Crear cuenta
        </Text>
        <Text style={{ color: t.text.secondary, fontSize: 15, marginBottom: 40 }}>
          Empezá tu camino hacia la maestría.
        </Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nombre"
              onChangeText={onChange}
              value={value}
              autoComplete="name"
              error={errors.displayName?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Contraseña"
              onChangeText={onChange}
              value={value}
              secureTextEntry
              autoComplete="new-password"
              error={errors.password?.message}
              containerStyle={{ marginBottom: 16 }}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirmar contraseña"
              onChangeText={onChange}
              value={value}
              secureTextEntry
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              containerStyle={{ marginBottom: 24 }}
            />
          )}
        />

        {error ? (
          <Text style={{ color: t.status.danger, marginBottom: 16, fontSize: 14 }}>
            {error}
          </Text>
        ) : null}

        <Button
          label="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginBottom: 16 }}
        />

        <Link href="/(auth)/login" asChild>
          <Text style={{ color: t.accent.primary, textAlign: "center", fontSize: 14 }}>
            ¿Ya tenés cuenta? Iniciá sesión
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
