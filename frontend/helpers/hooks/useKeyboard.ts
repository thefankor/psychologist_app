// hooks/useKeyboardAnimation.ts
import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

export const useKeyboardAnimation = () => {
	const keyboardHeight = useSharedValue(0);

	useEffect(() => {
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const keyboardWillShowListener = Keyboard.addListener(
			showEvent,
			(e) => {
				const height = e.endCoordinates.height;

				const duration = Platform.OS === 'ios' ? e.duration : 300;

				keyboardHeight.value = withTiming(-height + 200, {
					duration: duration,
					easing: Easing.out(Easing.cubic),
				});
			}
		);

		const keyboardWillHideListener = Keyboard.addListener(
			hideEvent,
			(e) => {
				const duration = Platform.OS === 'ios' ? e.duration : 300;

				keyboardHeight.value = withTiming(0, {
					duration: duration,
					easing: Easing.out(Easing.cubic),
				});
			}
		);

		return () => {
			keyboardWillShowListener.remove();
			keyboardWillHideListener.remove();
		};
	}, []);

	return { keyboardHeight };
};
