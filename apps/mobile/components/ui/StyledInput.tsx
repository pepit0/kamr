import { Keyboard, TextInput, type TextInputProps } from "react-native";
import { useState } from "react";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts } from "../../lib/theme/typography";

interface StyledInputProps extends TextInputProps {
  display?: boolean;
}

export function StyledInput({
  display,
  style,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType,
  blurOnSubmit,
  multiline,
  ...props
}: StyledInputProps) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={c.textTer}
      returnKeyType={returnKeyType ?? (multiline ? "default" : "done")}
      blurOnSubmit={blurOnSubmit ?? !multiline}
      {...props}
      multiline={multiline}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onSubmitEditing={(e) => {
        if (!multiline) {
          Keyboard.dismiss();
        }
        onSubmitEditing?.(e);
      }}
      style={[
        {
          width: "100%",
          backgroundColor: focused ? c.surfaceActive : c.surface,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: c.text,
          fontFamily: display ? fonts.display : fonts.body,
          fontSize: display ? 22 : 14,
        },
        style,
      ]}
    />
  );
}
