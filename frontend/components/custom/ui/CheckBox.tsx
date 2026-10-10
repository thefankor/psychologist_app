import { View, Pressable, Image, StyleSheet, ViewStyle } from 'react-native';

interface Props {
	isActive?: boolean;
	onPress?: () => void;
	radio?: boolean;
	checkboxClass?: ViewStyle | null;
}

export const Checkbox = ({
	isActive,
	onPress,
	radio = false,
	checkboxClass,
}: Props) => {
	return (
		<Pressable
			style={[
				styles.checkbox,
				isActive && styles.active,
				radio && styles.radio,
				isActive && radio && styles.active,
				checkboxClass,
			]}
			onPress={onPress}
		>
			{isActive && !radio && (
				<Image
					source={require('@/assets/images/checked.png')}
					width={16}
					height={16}
					style={styles.checked}
				/>
			)}
			{isActive && radio && <View style={styles.radio__active} />}
		</Pressable>
	);
};

export const styles = StyleSheet.create({
	checkbox: {
		height: 20,
		width: 20,
		borderColor: '#0114431A',
		borderWidth: 1.5,
		display: 'flex',
		flexDirection: 'row',
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radio: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	active: {
		backgroundColor: '#3871FF',
		borderRadius: 4,
	},
	radio__active: {
		backgroundColor: '#fff',
		height: 12,
		width: 12,
		borderRadius: 4,
	},
	checked: {
		width: 12,
		height: 12,
	},
});
