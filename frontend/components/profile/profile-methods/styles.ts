import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "90%",
    marginTop: 10,
  },
  container__title: {
    fontFamily: "Hezaedrus500",
    fontSize: 18,
    color: "#011443",
    marginTop: 30,
  },
  container__method: {
    backgroundColor: "#fff",
    width: "100%",
    height: "auto",
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  link__method: {
    width: "100%",
    height: 44,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
  },
  method__wrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  method__text: {
    color: "#011443",
    fontFamily: "Hezaedrus",
    fontSize: 14,
    marginLeft: 16,
  },
  method__image: {
    height: 24,
    width: 24,
  },
});
