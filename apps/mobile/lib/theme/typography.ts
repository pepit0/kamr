export const fonts = {
  body: "Jost_400Regular",
  bodyMedium: "Jost_500Medium",
  bodyLight: "Jost_300Light",
  display: "DancingScript_700Bold",
  displayRegular: "DancingScript_400Regular",
} as const;

export const type = {
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  displayLarge: {
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: "700" as const,
    lineHeight: 46,
  },
  displayMedium: {
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: "700" as const,
    lineHeight: 44,
  },
  displaySmall: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: "700" as const,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  stat: {
    fontFamily: fonts.bodyLight,
    fontSize: 26,
    lineHeight: 34,
  },
};
