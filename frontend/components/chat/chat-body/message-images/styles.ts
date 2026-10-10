import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    height: "auto",
    width: "auto",
    paddingLeft: 2,
    paddingRight: 2,
    overflow: "hidden",
  },
  container__image: {
    width: "auto",
    height: "auto",
    gap: 2,
    paddingBottom: 12,
  },
  image: {
    borderRadius: 4,
    resizeMode: "cover",
  },
  singleImage: {
    width: "100%",
    height: 200,
  },
  twoImages: {
    flex: 1,
    height: 150,
  },
  multipleImages: {
    height: 100,
  },
  fourImagesContainer: {},
});
