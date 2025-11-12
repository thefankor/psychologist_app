import { UI } from "@/types/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  container__title: {
    fontFamily: "Hezaedrus",
    marginTop: 160,
    width: 230,
    textAlign: "center",
    color: UI.colors.descriptionGray,
  },
  conatiner__content: {
    marginTop: 24,
    width: "100%",
    height: "auto",
  },
});
