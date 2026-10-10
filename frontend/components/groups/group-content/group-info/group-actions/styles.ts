import { UI } from "@/types/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "49%",
    height: "100%",
    backgroundColor: UI.colors.lightContainer,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    pointerEvents: "auto",
    zIndex: 10,
    boxShadow: "0px 0px 12px 0px #E2E2E240",
  },
  container__image: {
    height: 24,
    width: 24,
  },
  container__name: {
    marginTop: 4,
    color: UI.colors.pressableColor,
    fontFamily: "Hezaedrus",
    fontSize: 12,
  },
});
