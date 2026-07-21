import { View, Text, Image, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { fonts } from "../../lib/theme/typography";
import { IcoPersonSilhouette } from "./Icons";

interface ProfileAvatarProps {
  initials?: string;
  photoUri?: string;
  size?: number;
  hasProfile?: boolean;
  style?: ViewStyle;
}

export function ProfileAvatar({
  initials = "",
  photoUri,
  size = 40,
  hasProfile = true,
  style,
}: ProfileAvatarProps) {
  const { c } = useTheme();
  const isPlaceholder = !hasProfile;
  const fontSize = size <= 24 ? 11 : size <= 40 ? 13 : Math.round(size * 0.36);
  const iconSize = Math.round(size * 0.5);

  const avatarStyle = photoUri
    ? { backgroundColor: c.surface }
    : isPlaceholder
      ? {
          backgroundColor: c.bg,
          borderWidth: 1,
          borderColor: c.textTer,
        }
      : {
          backgroundColor: c.inv,
        };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        avatarStyle,
        style,
      ]}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : isPlaceholder ? (
        <IcoPersonSilhouette size={iconSize} color={c.textTer} />
      ) : (
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize,
            lineHeight: Math.round(fontSize * 1.25),
            color: c.invText,
          }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
