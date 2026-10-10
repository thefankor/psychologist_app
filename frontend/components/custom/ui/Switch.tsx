import { Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';

interface Props {
	isActive?: boolean;
	setActive?: () => void;
	onPress: () => void;
}

export const Switch = ({ isActive, setActive, onPress }: Props) => {
	const animatedValue = useRef(new Animated.Value(isActive ? 1 : 0)).current;

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isActive ? 1 : 0,
			duration: 200,
			easing: Easing.linear,
			useNativeDriver: true,
		}).start();
	}, [isActive]);

	const switcherTransform = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 20],
	});

	return (
		<Pressable
			onPress={setActive ? setActive : onPress}
			style={[styles.switch, isActive && styles.switch__active]}
		>
			<Animated.View
				style={[
					styles.switcher,
					{
						transform: [{ translateX: switcherTransform }],
					},
				]}
			/>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	switch: {
		width: 51,
		height: 31,
		backgroundColor: '#E9E9E9',
		borderRadius: 100,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 2,
		paddingRight: 2,
	},
	switcher: {
		backgroundColor: '#fff',
		height: 27,
		width: 27,
		borderRadius: 100,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	switch__active: {
		backgroundColor: '#3871FF',
	},
});
