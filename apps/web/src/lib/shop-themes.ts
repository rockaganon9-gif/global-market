export interface ShopThemeStyle {
  pageClass: string;
  heroClass: string;
  eyebrowClass: string;
  titleClass: string;
  descriptionClass: string;
  metaClass: string;
  gridGapClass: string;
  card: {
    wrapClass: string;
    bgClass: string;
    titleClass: string;
    metaClass: string;
  };
}

const DEFAULT_THEME: ShopThemeStyle = {
  pageClass: "bg-white",
  heroClass: "bg-emerald-700 text-white rounded-2xl px-6 py-8 sm:px-10 sm:py-12",
  eyebrowClass: "text-emerald-200",
  titleClass: "text-white",
  descriptionClass: "text-emerald-50",
  metaClass: "text-emerald-100",
  gridGapClass: "gap-4",
  card: {
    wrapClass: "rounded-xl shadow-sm hover:shadow-lg",
    bgClass: "bg-white",
    titleClass: "text-neutral-900",
    metaClass: "text-neutral-500",
  },
};

export const SHOP_THEMES: Record<string, ShopThemeStyle> = {
  classic: DEFAULT_THEME,
  minimal: {
    pageClass: "bg-white",
    heroClass: "bg-white text-neutral-900 border-b border-black/10 px-0 py-8 sm:py-12",
    eyebrowClass: "text-neutral-400 uppercase tracking-widest text-xs",
    titleClass: "text-neutral-900",
    descriptionClass: "text-neutral-500",
    metaClass: "text-neutral-400",
    gridGapClass: "gap-6",
    card: {
      wrapClass: "rounded-none shadow-none border-black/10",
      bgClass: "bg-white",
      titleClass: "text-neutral-900",
      metaClass: "text-neutral-400",
    },
  },
  vibrant: {
    pageClass: "bg-white",
    heroClass:
      "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400 text-white rounded-3xl px-6 py-10 sm:px-12 sm:py-16",
    eyebrowClass: "text-white/80 uppercase tracking-widest text-xs font-bold",
    titleClass: "text-white",
    descriptionClass: "text-white/90",
    metaClass: "text-white/80",
    gridGapClass: "gap-5",
    card: {
      wrapClass: "rounded-2xl shadow-sm hover:shadow-lg",
      bgClass: "bg-white",
      titleClass: "text-neutral-900",
      metaClass: "text-fuchsia-600",
    },
  },
  prestige: {
    pageClass: "bg-neutral-950",
    heroClass: "bg-neutral-950 text-amber-50 border-b border-amber-500/20 px-0 py-10 sm:py-16",
    eyebrowClass: "text-amber-400 uppercase tracking-[0.2em] text-xs font-semibold",
    titleClass: "text-amber-50",
    descriptionClass: "text-neutral-300",
    metaClass: "text-neutral-400",
    gridGapClass: "gap-5",
    card: {
      wrapClass: "rounded-xl shadow-none border-amber-500/10",
      bgClass: "bg-neutral-900",
      titleClass: "text-amber-50",
      metaClass: "text-amber-500/70",
    },
  },
  "boutique-pro": {
    pageClass: "bg-neutral-50",
    heroClass: "bg-neutral-50 text-neutral-900 border-b-4 border-neutral-900 px-0 py-10 sm:py-14",
    eyebrowClass: "text-neutral-500 uppercase tracking-[0.25em] text-xs",
    titleClass: "text-neutral-900 font-serif",
    descriptionClass: "text-neutral-600",
    metaClass: "text-neutral-500",
    gridGapClass: "gap-6",
    card: {
      wrapClass: "rounded-none shadow-none border-neutral-900/10",
      bgClass: "bg-white",
      titleClass: "text-neutral-900 font-serif",
      metaClass: "text-neutral-500",
    },
  },
};

export function getShopTheme(slug?: string | null): ShopThemeStyle {
  if (!slug) return DEFAULT_THEME;
  return SHOP_THEMES[slug] ?? DEFAULT_THEME;
}
