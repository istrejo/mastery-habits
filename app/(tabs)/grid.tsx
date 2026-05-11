/* stitch: power-grid */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, resolveCategory } from "@habits/index";

type Tier = "high" | "mediumHigh" | "medium" | "low" | "dead";

function getTier(score: number): Tier {
  if (score >= 71) return "high";
  if (score >= 46) return "mediumHigh";
  if (score >= 21) return "medium";
  if (score > 0) return "low";
  return "dead";
}

export default function PowerGridScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, loading } = useHabits();

  const sorted = [...habits].sort(
    (a, b) => (b.mastery_scores?.score ?? 0) - (a.mastery_scores?.score ?? 0)
  );

  const cellStyleFor = (tier: Tier) => {
    switch (tier) {
      case "high":
        return {
          backgroundColor: theme.accent.primary,
          borderColor: theme.accent.primary,
          textColor: theme.accent.onPrimary,
          emojiOpacity: 1,
          shadowColor: theme.accent.primary,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 6,
        };
      case "mediumHigh":
        return {
          backgroundColor: `${theme.accent.primary}CC`,
          borderColor: `${theme.accent.primary}CC`,
          textColor: theme.accent.onPrimary,
          emojiOpacity: 1,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case "medium":
        return {
          backgroundColor: `${theme.accent.primary}66`,
          borderColor: `${theme.accent.primary}66`,
          textColor: theme.text.primary,
          emojiOpacity: 1,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case "low":
        return {
          backgroundColor: theme.bg.surfaceAlt,
          borderColor: theme.border.subtle,
          textColor: theme.text.secondary,
          emojiOpacity: 0.5,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
      case "dead":
        return {
          backgroundColor: theme.bg.elevated,
          borderColor: theme.border.subtle,
          textColor: theme.text.tertiary,
          emojiOpacity: 0.3,
          shadowColor: "transparent",
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };
    }
  };

  return (
    <Screen scrollable>
      {/* TopAppBar */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.stackMd,
      }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("dashboard.app_name")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/habit/new")}
          style={{
            backgroundColor: theme.accent.primary,
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.accent.onPrimary, fontSize: 22, fontWeight: "700" }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={{ gap: theme.spacing.unit, marginBottom: theme.spacing.stackMd }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleLg.fontSize,
          fontWeight: "700",
          fontFamily: "Inter_700Bold",
          letterSpacing: theme.typography.scale.titleLg.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("power_grid.title")}
        </Text>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("power_grid.subtitle", { count: habits.length })}
        </Text>
      </View>

      {loading ? null : habits.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: theme.spacing.stackLg * 2 }}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.stackMd }}>⚡</Text>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
          }}>
            {t("power_grid.empty")}
          </Text>
        </View>
      ) : (
        <View style={{ gap: theme.spacing.stackLg }}>
          {/* Grid */}
          <View style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.stackSm,
          }}>
            {sorted.map((habit) => {
              const score = habit.mastery_scores?.score ?? 0;
              const { emoji } = resolveCategory(habit);
              const tier = getTier(score);
              const style = cellStyleFor(tier);

              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  style={{
                    width: "31%",
                    aspectRatio: 1,
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                    borderWidth: theme.borderWidth.default,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.stackSm,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: theme.spacing.unit,
                    shadowColor: style.shadowColor,
                    shadowOpacity: style.shadowOpacity,
                    shadowRadius: style.shadowRadius,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: style.elevation,
                  }}
                >
                  <Text style={{ fontSize: 32, opacity: style.emojiOpacity }}>{emoji}</Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: style.textColor,
                      fontSize: theme.typography.scale.microBold.fontSize,
                      fontFamily: "Inter_600SemiBold",
                      fontWeight: "600",
                      letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                      textTransform: "uppercase",
                      textAlign: "center",
                      lineHeight: theme.typography.scale.microBold.lineHeight,
                    }}
                  >
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderColor: theme.border.subtle,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            gap: theme.spacing.stackSm,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: "Inter_600SemiBold",
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: "uppercase",
              }}>
                {t("power_grid.low_energy")}
              </Text>
              <Text style={{
                color: theme.accent.primary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: "Inter_600SemiBold",
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: "uppercase",
              }}>
                {t("power_grid.full_power")}
              </Text>
            </View>
            <LinearGradient
              colors={[theme.bg.elevated, `${theme.accent.primary}66`, theme.accent.primary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: 12,
                borderRadius: theme.radius.pill,
                borderWidth: theme.borderWidth.default,
                borderColor: theme.border.subtle,
              }}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}
