import { permanentRedirect } from "next/navigation";
import { EXTRA_VS_SAVINGS_PATH, HOME_GUIDE_THEME_PATH, guideArticleAnchor } from "@/lib/guides";

export default function ExtraVsSavingsGuideRedirect() {
  permanentRedirect(`${HOME_GUIDE_THEME_PATH}#${guideArticleAnchor(EXTRA_VS_SAVINGS_PATH)}`);
}
