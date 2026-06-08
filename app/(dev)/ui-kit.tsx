import { ScrollView, Text, View } from "react-native";
import { Button } from "../../src/shared/ui/Button";
import { Card } from "../../src/shared/ui/Card";
import { Checkbox } from "../../src/shared/ui/Checkbox";
import { useState } from "react";

export default function UiKitScreen() {
  const [checked, setChecked] = useState(false);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <Text className="text-3xl font-bold text-gray-900 mb-8">UI Kit</Text>

      <Text className="text-lg font-semibold text-gray-700 mb-3">Buttons</Text>
      <View className="gap-3 mb-8">
        <Button label="Primary" onPress={() => {}} />
        <Button label="Secondary" onPress={() => {}} variant="secondary" />
        <Button label="Ghost" onPress={() => {}} variant="ghost" />
        <Button label="Disabled" onPress={() => {}} disabled />
      </View>

      <Text className="text-lg font-semibold text-gray-700 mb-3">Card</Text>
      <Card className="mb-8">
        <Text className="text-gray-900 font-medium">Card title</Text>
        <Text className="text-gray-500 text-sm mt-1">Card content goes here.</Text>
      </Card>

      <Text className="text-lg font-semibold text-gray-700 mb-3">Checkbox</Text>
      <View className="flex-row items-center gap-3 mb-8">
        <Checkbox checked={checked} onToggle={() => setChecked((v) => !v)} />
        <Text className="text-gray-700">{checked ? "Checked" : "Unchecked"}</Text>
      </View>
    </ScrollView>
  );
}
