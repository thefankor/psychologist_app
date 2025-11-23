import { Image, Pressable, Text } from "react-native";
import { ChatAction } from "./actions";
import { styles } from "./styles";

const GroupAction = ({ name, image, action, disabled }: ChatAction) => {
  return (
    <Pressable
      onPress={action}
      style={[styles.container, disabled && { opacity: 0.3 }]}
    >
      <Image source={image} style={styles.container__image} />
      <Text style={styles.container__name}>{name}</Text>
    </Pressable>
  );
};
export default GroupAction;
