import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "auto",
    flexDirection: "row",
    position: "relative",
    alignItems: "center",
    pointerEvents: "box-none",
    gap: 12,
  },
  container__image: {
    position: "absolute",
    height: 28,
    width: 28,
    zIndex: 4,
    marginLeft: 16,
  },
  container__input: {
    height: 44,
    flex: 1,
    borderRadius: 22,
    fontFamily: "Hezaedrus",
    backgroundColor: "#f2f2f2ff",
    paddingLeft: 55,
    pointerEvents: "none",
    color: "rgba(1, 20, 67, 0.77)",
  },
  send__btn: {
    height: 40,
    width: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#3871FF",
  },
  send__img: {
    height: 26,
    width: 26,
  },
});
