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

export default function SignupScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { signUp, loading, error } = useAuth();

  const schema = useMemo(
    () =>
      z
        .object({
          displayName: z.string().min(2, t("signup.error_name_min")).max(40),
          email: z.string().email(t("signup.error_email")),
          password: z.string().min(6, t("signup.error_password_min")),
          confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
          message: t("signup.error_passwords_match"),
          path: ["confirmPassword"],
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
    signUp(data.email, data.password, data.displayName);
  };

  return (
    <Screen scrollable>
      <View style={{ flex: 1, justifyContent: "center", paddingVertical: 40 }}>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 6,
            fontFamily: theme.typography.displayFontFamily,
          }}
        >
          {t("signup.title")}
        </Text>
        <Text style={{ color: theme.text.secondary, fontSize: 15, marginBottom: 40 }}>
          {t("signup.tagline")}
        </Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, value } }) => (
            <Input
              label={t("signup.name_label")}
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
              label={t("signup.email_label")}
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
              label={t("signup.password_label")}
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
              label={t("signup.confirm_password_label")}
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
          <Text style={{ color: theme.status.danger, marginBottom: 16, fontSize: 14 }}>
            {error}
          </Text>
        ) : null}

        <Button
          label={t("signup.submit")}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginBottom: 16 }}
        />

        <Link href="/(auth)/login" asChild>
          <Text style={{ color: theme.accent.primary, textAlign: "center", fontSize: 14 }}>
            {t("signup.go_login")}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
