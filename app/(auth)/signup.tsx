/* stitch: register */
import { useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth, CheckEmailView } from "@auth/index";
import { Screen, Input, Button, Card } from "@core/components";
import { useTheme } from "@core/theming";

export default function SignupScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
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

  const schema = useMemo(() => z.object({
    displayName: z.string().min(2, t("signup.error_name_min")).max(40),
    email: z.string().email(t("signup.error_email")),
    password: z.string().min(6, t("signup.error_password_min")),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, { message: t("signup.error_passwords_match"), path: ["confirmPassword"] }), [t]);

  type FormData = z.infer<typeof schema>;
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = (data: FormData) => signUp(data.email, data.password, data.displayName);

  const errorMessage = error && !error.endsWith("_timeout") ? error : null;
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
          {errorMessage ? (
            <Text style={{ color: theme.status.danger, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium" }}>{errorMessage}</Text>
          ) : null}
          {timeoutMessage ? (
            <Text style={{ color: theme.status.danger, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium" }}>{timeoutMessage}</Text>
          ) : null}
          <Button label={t("signup.submit")} onPress={handleSubmit(onSubmit)} loading={loading} iconRight="arrow-forward" />
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
