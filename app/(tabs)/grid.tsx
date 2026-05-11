/* stitch: power-grid */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, resolveCategory } from "@habits/index";

function intensityStyle(score: number, accentColor: string) {
  if (score >= 71) return { opacity: 1, tintColor: accentColor };
  if (score >= 46) return { opacity: 0.8, tintColor: accentColor };
  if (score >= 21) return { opacity: 0.6, tintColor: undefined };
  return { opacity: 0.3, tintColor: undefined };
}

export default function PowerGridScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, loading } = useHabits();

  const sorted = [...habits].sort(
    (a, b) => (b.mastery_scores?.score ?? 0) - (a.mastery_scores?.score ?? 0)
  );

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

      {loading ? null : habits.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: theme.spacing.stackLg * 2 }}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.stackMd }}>⚡</Text>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_400Regular",
            textAlign: "center",
          }}>
            No habits yet. Add one to power up.
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
              const { opacity, tintColor } = intensityStyle(score, theme.accent.primary);
              const borderColor = tintColor ?? theme.border.subtle;

              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  style={{
                    width: "31%",
                    aspectRatio: 1,
                    backgroundColor: theme.bg.surfaceAlt,
                    borderColor,
                    borderWidth: theme.borderWidth.default,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.stackSm,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: theme.spacing.unit,
                    opacity,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.microBold.fontSize,
                      fontFamily: "Inter_600SemiBold",
                      fontWeight: "600",
                      textAlign: "center",
                      lineHeight: theme.typography.scale.microBold.lineHeight,
                    }}
                  >
                    {habit.name}
                  </Text>
                  <Text style={{
                    color: tintColor ?? theme.text.secondary,
                    fontSize: theme.typography.scale.labelCaps.fontSize,
                    fontFamily: "Inter_700Bold",
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                  }}>
                    {score.toFixed(0)}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={{
            borderTopWidth: theme.borderWidth.default,
            borderTopColor: theme.border.subtle,
            paddingTop: theme.spacing.stackMd,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: "Inter_500Medium",
              letterSpacing: theme.typography.scale.microBold.letterSpacing,
            }}>
              LOW ENERGY
            </Text>
            <View style={{ flexDirection: "row", gap: theme.spacing.unit, alignItems: "center" }}>
              {[0.3, 0.6, 0.8, 1].map((op, i) => (
                <View
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: theme.radius.sm / 2,
                    backgroundColor: theme.accent.primary,
                    opacity: op,
                  }}
                />
              ))}
            </View>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: "Inter_500Medium",
              letterSpacing: theme.typography.scale.microBold.letterSpacing,
            }}>
              FULL POWER
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
