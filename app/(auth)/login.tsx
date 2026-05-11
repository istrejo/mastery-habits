/* stitch: login */
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
      <View style={{ flex: 1, justifyContent: "center", paddingVertical: theme.spacing.stackLg }}>

        {/* Header */}
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleLg.fontSize,
          fontWeight: "700",
          fontFamily: "Inter_700Bold",
          letterSpacing: theme.typography.scale.titleLg.letterSpacing,
          textTransform: "uppercase",
          marginBottom: theme.spacing.unit,
        }}>
          {t("login.app_title")}
        </Text>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.bodyMain.fontSize,
          fontFamily: "Inter_400Regular",
          lineHeight: theme.typography.scale.bodyMain.lineHeight,
          marginBottom: theme.spacing.stackLg,
        }}>
          {t("login.tagline")}
        </Text>

        {/* Fields */}
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
              containerStyle={{ marginBottom: theme.spacing.stackMd }}
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
              containerStyle={{ marginBottom: theme.spacing.stackMd }}
            />
          )}
        />

        {error ? (
          <Text style={{
            color: theme.status.danger,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: "Inter_500Medium",
            marginBottom: theme.spacing.stackSm,
          }}>
            {error}
          </Text>
        ) : null}

        <Button
          label={t("login.submit")}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginBottom: theme.spacing.stackMd }}
        />

        <Link href="/(auth)/signup" asChild>
          <Text style={{
            color: theme.accent.primary,
            textAlign: "center",
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: "Inter_500Medium",
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: "uppercase",
            textDecorationLine: "underline",
          }}>
            {t("login.go_signup")}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
