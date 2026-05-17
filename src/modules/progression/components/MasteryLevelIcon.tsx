import { useCurrentMode } from "@core/theming";
import type { LevelKey } from "../types";
import SeedDarkIcon from "../../../../assets/icons/dark/seed.svg";
import SproutDarkIcon from "../../../../assets/icons/dark/sprout.svg";
import TreeDarkIcon from "../../../../assets/icons/dark/tree.svg";
import ForestDarkIcon from "../../../../assets/icons/dark/forest.svg";
import AncientDarkIcon from "../../../../assets/icons/dark/ancient.svg";
import SeedLightIcon from "../../../../assets/icons/light/seed.svg";
import SproutLightIcon from "../../../../assets/icons/light/sprout.svg";
import TreeLightIcon from "../../../../assets/icons/light/tree.svg";
import ForestLightIcon from "../../../../assets/icons/light/forest.svg";
import AncientLightIcon from "../../../../assets/icons/light/ancient.svg";

interface MasteryLevelIconProps {
  level: LevelKey;
  size?: number;
}

const DARK_ICONS = {
  seed: SeedDarkIcon,
  sprout: SproutDarkIcon,
  tree: TreeDarkIcon,
  forest: ForestDarkIcon,
  ancient: AncientDarkIcon,
} as const;

const LIGHT_ICONS = {
  seed: SeedLightIcon,
  sprout: SproutLightIcon,
  tree: TreeLightIcon,
  forest: ForestLightIcon,
  ancient: AncientLightIcon,
} as const;

export function MasteryLevelIcon({ level, size = 20 }: MasteryLevelIconProps) {
  const mode = useCurrentMode();
  const Icon = (mode === "dark" ? DARK_ICONS : LIGHT_ICONS)[level];

  return <Icon width={size} height={size} />;
}
