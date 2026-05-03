import { useMemo } from "react";
import { Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@auth/index";
import { Screen, Input, Button } from "@core/components";
import { useTheme } from "@core/theming";

export default function LoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { signIn, loading, error } = useAuth();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t("login.error_email")),
        password: z.string().min(6, t("login.error_password_min")),
      }),
    [t]
  );

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    signIn(data.email, data.password);
  };

  return (
    <Screen scrollable>
      <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40 }}>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 6,
            fontFamily: theme.typography.displayFontFamily,
          }}
        >
          {t("login.app_title")}
        </Text>
        <Text style={{ color: theme.text.secondary, fontSize: 15, marginBottom: 40 }}>
          {t("login.tagline")}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t("login.email_label")}
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
              label={t("login.password_label")}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              autoComplete="current-password"
              error={errors.password?.message}
              containerStyle={{ marginBottom: 24 }}
            />
          )}
        />

        {error ? (
          <Text style={{ color: theme.status.danger, marginBottom: 16, fontSize: 14 }}>
            {error}
          </Text>
        ) : null}

        <Button
          label={t("login.submit")}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginBottom: 16 }}
        />

        <Link href="/(auth)/signup" asChild>
          <Text style={{ color: theme.accent.primary, textAlign: "center", fontSize: 14 }}>
            {t("login.go_signup")}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
