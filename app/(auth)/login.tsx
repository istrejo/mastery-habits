/* stitch: login */
import { useMemo, useRef, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth, SocialAuthButtons } from "@auth/index";
import { Screen, Input, Button } from "@core/components";
import { useTheme } from "@core/theming";

const taglineBase = {
  fontFamily: "Lexend_600SemiBold" as const,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  textAlign: "center" as const,
};

export default function LoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { signIn, resendVerification, loading, error, resendSent } = useAuth();
  const [resending, setResending] = useState(false);
  const pendingEmailRef = useRef<string | null>(null);

  const schema = useMemo(() => z.object({ email: z.email({ error: t("login.error_email") }), password: z.string().min(6, t("login.error_password_min")) }), [t]);
  type FormData = z.infer<typeof schema>;
  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = (data: FormData) => {
    pendingEmailRef.current = data.email;
    void signIn(data.email, data.password);
  };

  const errorMessage = useMemo(() => {
    if (resendSent) return t("login.resend_sent");
    if (!error) return null;
    if (error === "email_not_confirmed") return t("login.error_email_not_confirmed");
    if (error.endsWith("_timeout")) return t("login.error_oauth_timeout");
    return error;
  }, [error, resendSent, t]);

  const onResend = () => {
    const email = pendingEmailRef.current ?? getValues('email');
    if (!email) return;
    setResending(true);
    void resendVerification(email).finally(() => setResending(false));
  };

  return (
    <Screen scrollable={false} contentStyle={{ justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: "100%", maxWidth: 420, alignItems: "center" }}>
        <View style={{ alignItems: "center", marginBottom: theme.spacing.stackLg }}>
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displaySm.fontSize, lineHeight: theme.typography.scale.displaySm.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displaySm.letterSpacing, textTransform: "uppercase", textAlign: "center" }}>
            {t("login.app_title")}
          </Text>
          <Text style={[
            taglineBase,
            {
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              borderTopWidth: theme.borderWidth.default,
              borderTopColor: theme.border.default,
              paddingTop: theme.spacing.stackSm,
              marginTop: theme.spacing.stackSm,
            },
          ]}>
            {t("login.tagline")}
          </Text>
        </View>

        <View style={{ width: "100%", gap: theme.spacing.stackMd, marginBottom: theme.spacing.stackLg }}>
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input variant="underline" label={t("login.email_label")} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email?.message} />
          )} />
          <View style={{ gap: theme.spacing.stackSm }}>
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
              <Input variant="underline" label={t("login.password_label")} onChangeText={onChange} value={value} secureTextEntry autoComplete="current-password" error={errors.password?.message} />
            )} />
            <Pressable style={{ alignSelf: "flex-end" }}>
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium" }}>{t("login.forgot")}</Text>
            </Pressable>
          </View>
          {errorMessage ? (
            <Text style={{ color: resendSent ? theme.status.success : theme.status.danger, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium" }}>
              {errorMessage}
            </Text>
          ) : null}
          {error === "email_not_confirmed" ? (
            <Button
              label={t("login.resend_verification")}
              onPress={onResend}
              loading={resending}
              variant="secondary"
            />
          ) : null}
          <Button label={t("login.submit")} onPress={handleSubmit(onSubmit)} loading={loading} iconRight="arrow-forward" style={{ marginTop: theme.spacing.stackSm }} />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.unit }}>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_400Regular" }}>{t("login.no_account")}</Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", borderBottomWidth: 1, borderBottomColor: theme.text.primary }}>{t("login.go_signup")}</Text>
            </Pressable>
          </Link>
        </View>

        <SocialAuthButtons />
      </View>
    </Screen>
  );
}
