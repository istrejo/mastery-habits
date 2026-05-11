/* stitch: register */
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
          {t("signup.title")}
        </Text>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.bodyMain.fontSize,
          fontFamily: "Inter_400Regular",
          lineHeight: theme.typography.scale.bodyMain.lineHeight,
          marginBottom: theme.spacing.stackLg,
        }}>
          {t("signup.tagline")}
        </Text>

        {/* Fields */}
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
              containerStyle={{ marginBottom: theme.spacing.stackMd }}
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
              containerStyle={{ marginBottom: theme.spacing.stackMd }}
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
              containerStyle={{ marginBottom: theme.spacing.stackMd }}
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
          label={t("signup.submit")}
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          style={{ marginBottom: theme.spacing.stackMd }}
        />

        <Link href="/(auth)/login" asChild>
          <Text style={{
            color: theme.accent.primary,
            textAlign: "center",
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: "Inter_500Medium",
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: "uppercase",
            textDecorationLine: "underline",
          }}>
            {t("signup.go_login")}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
