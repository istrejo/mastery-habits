/* stitch: login */
import { useMemo } from "react";
import { Text, View, Pressable } from "react-native";
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
    <Screen scrollable={false}>
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: theme.spacing.marginMobile,
      }}>

        {/* Display header */}
        <Text style={{
          color: theme.accent.primary,
          fontSize: theme.typography.scale.displaySm.fontSize,
          fontWeight: "900",
          fontFamily: "Inter_900Black",
          letterSpacing: theme.typography.scale.displaySm.letterSpacing,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: theme.spacing.stackSm,
        }}>
          {t("login.app_title")}
        </Text>

        {/* Tagline */}
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: theme.spacing.stackLg,
        }}>
          {t("login.tagline")}
        </Text>

        {/* Form card */}
        <View style={{
          backgroundColor: theme.bg.surfaceAlt,
          borderColor: theme.border.subtle,
          borderWidth: theme.borderWidth.default,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.marginMobile,
          width: "100%",
          maxWidth: 480,
          gap: theme.spacing.stackMd,
        }}>

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
              />
            )}
          />

          <View style={{ gap: theme.spacing.stackSm }}>
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
                />
              )}
            />
            <Link href="#" asChild>
              <Pressable style={{ alignSelf: "flex-end" }}>
                <Text style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: "Inter_500Medium",
                }}>
                  {t("login.forgot")}
                </Text>
              </Pressable>
            </Link>
          </View>

          {error ? (
            <Text style={{
              color: theme.status.danger,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: "Inter_500Medium",
            }}>
              {error}
            </Text>
          ) : null}

          <Button
            label={t("login.submit")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            iconRight="arrow-forward"
          />
        </View>

        {/* Footer link */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.unit,
          marginTop: theme.spacing.stackLg,
        }}>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: "Inter_400Regular",
          }}>
            {t("login.no_account")}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={{
                color: theme.accent.primary,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: "Inter_600SemiBold",
                borderBottomWidth: 1,
                borderBottomColor: theme.accent.primary,
              }}>
                {t("login.go_signup")}
              </Text>
            </Pressable>
          </Link>
        </View>

      </View>
    </Screen>
  );
}
