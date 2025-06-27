import { createEmotionCache } from "@mui/material-nextjs/v15-pagesRouter";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";

export const createRtlEmotionCache = () => {
  return createEmotionCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });
};

export const clientSideEmotionCache = createRtlEmotionCache();
