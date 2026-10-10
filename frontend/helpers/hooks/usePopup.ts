import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as NavigationBar from 'expo-navigation-bar';
import { closePopup } from '@/store/slices/popupSlice';
import { PanResponder, Animated, Dimensions } from 'react-native';

const usePopup = () => {
	const dispatch = useDispatch();
	const { height: SCREEN_HEIGHT } = Dimensions.get('window');
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
	const pan = useRef(new Animated.Value(0)).current;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return (
					Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 2)
				);
			},
			onPanResponderMove: (_, gestureState) => {
				if (gestureState.dy > 0) {
					pan.setValue(gestureState.dy);
				}
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dy > 100 || gestureState.vy > 0.5) {
					closeModal();
				} else {
					Animated.spring(pan, {
						toValue: 0,
						useNativeDriver: true,
					}).start();
				}
			},
		})
	).current;

	const combinedSlideAnim = Animated.add(slideAnim, pan);

	const closeModal = () => {
		NavigationBar.setVisibilityAsync('visible');

		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: SCREEN_HEIGHT,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => {
			dispatch(closePopup());
		});
	};

	useEffect(() => {
		Animated.parallel([
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	return {
		slideAnim: combinedSlideAnim,
		fadeAnim,
		closeModal,
		panResponder,
	};
};

export default usePopup;
