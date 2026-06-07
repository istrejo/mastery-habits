/* stitch: register */
import { useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useAuth, CheckEmailView } from "@auth/index";
import { Screen, Input, Button, Card } from "@core/components";
import { useTheme } from "@core/theming";

function mapSignupError(
  message: string | null,
  t: TFunction,
): string | null {
  if (!message) return null;
  const lower = message.toLowerCase();
  if (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists") ||
    lower.includes("email already")
  ) {
    return t("signup.error_already_registered");
  }
  if (lower.includes("password") && (lower.includes("short") || lower.includes("6 character") || lower.includes("weak"))) {
    return t("signup.error_weak_password");
  }
  if (lower.includes("invalid email") || lower.includes("email address is invalid") || lower.includes("unable to validate")) {
    return t("signup.error_invalid_email");
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("timeout")) {
    return t("signup.error_network");
  }
  return t("signup.error_generic");
}

interface SignupFormProps {
  onSubmit: (email: string, password: string, displayName?: string) => void;
  loading: boolean;
  error: string | null;
}

function SignupForm({ onSubmit, loading, error }: SignupFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const schema = useMemo(() => z.object({
    displayName: z.string().min(2, t("signup.error_name_min")).max(40),
    email: z.email({ error: t("signup.error_email") }),
    password: z.string().min(6, t("signup.error_password_min")),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, { message: t("signup.error_passwords_match"), path: ["confirmPassword"] }), [t]);

  type FormData = z.infer<typeof schema>;
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const handleFormSubmit = (data: FormData) => onSubmit(data.email, data.password, data.displayName);

  const mappedError = useMemo(() => mapSignupError(error, t), [error, t]);
  const timeoutMessage = error && error.endsWith("_timeout") ? t("login.error_oauth_timeout") : null;

  return (
    <Screen scrollable contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <View style={{ width: "100%", maxWidth: 440, alignSelf: "center" }}>
        <View style={{ marginBottom: theme.spacing.stackLg }}>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: theme.spacing.stackSm }}>
            {t("login.app_title")}
          </Text>
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, lineHeight: theme.typography.scale.titleLg.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.titleLg.letterSpacing, textTransform: "uppercase" }}>
            {t("signup.title")}
          </Text>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: "Lexend_400Regular", marginTop: theme.spacing.stackSm }}>
            {t("signup.tagline")}
          </Text>
        </View>

        <Card style={{ gap: theme.spacing.stackMd }}>
          <Controller control={control} name="displayName" render={({ field: { onChange, value } }) => <Input label={t("signup.name_label")} onChangeText={onChange} value={value} autoComplete="name" error={errors.displayName?.message} />} />
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Input label={t("signup.email_label")} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email?.message} />} />
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Input label={t("signup.password_label")} onChangeText={onChange} value={value} secureTextEntry autoComplete="new-password" error={errors.password?.message} />} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => <Input label={t("signup.confirm_password_label")} onChangeText={onChange} value={value} secureTextEntry autoComplete="new-password" error={errors.confirmPassword?.message} />} />
          {mappedError ? (
            <View style={{ backgroundColor: theme.status.danger + '15', borderRadius: theme.radius.md, padding: theme.spacing.stackMd }}>
              <Text style={{ color: theme.status.danger, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium", textAlign: 'center' }}>
                {mappedError}
              </Text>
            </View>
          ) : null}
          {timeoutMessage ? (
            <Text style={{ color: theme.status.danger, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium" }}>{timeoutMessage}</Text>
          ) : null}
          <Button label={t("signup.submit")} onPress={handleSubmit(handleFormSubmit)} loading={loading} iconRight="arrow-forward" />
        </Card>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: theme.spacing.unit, marginTop: theme.spacing.stackLg }}>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_400Regular" }}>{t("signup.have_account")}</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", borderBottomWidth: 1, borderBottomColor: theme.text.primary }}>{t("signup.go_login")}</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

export default function SignupScreen() {
  const { signUp, loading, error, signupEmail, clearSignupSuccess } = useAuth();

  if (signupEmail) {
    return (
      <Screen scrollable contentStyle={{ flexGrow: 1 }}>
        <CheckEmailView
          email={signupEmail}
          onDifferentEmail={clearSignupSuccess}
        />
      </Screen>
    );
  }

  return <SignupForm onSubmit={signUp} loading={loading} error={error} />;
}
