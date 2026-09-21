import { permanentRedirect } from "next/navigation";
import { HOME_GUIDE_THEME_PATH, TRUE_COST_PATH, guideArticleAnchor } from "@/lib/guides";

export default function TrueCostGuideRedirect() {
  permanentRedirect(`${HOME_GUIDE_THEME_PATH}#${guideArticleAnchor(TRUE_COST_PATH)}`);
}
