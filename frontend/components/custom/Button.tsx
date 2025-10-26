import {
	Pressable,
	Text,
	TextStyle,
	ViewStyle,
	View,
	StyleSheet,
} from 'react-native';

interface Props {
	text: string;
	style?: ViewStyle | ViewStyle[];
	textStyle?: TextStyle | TextStyle[];
	onPress?: () => void;
	pressColor: string;
	disabled?: boolean;

	counter?: number;
}

const Button: React.FC<Props> = ({
	text,
	style,
	disabled,
	textStyle,
	onPress,
	pressColor,
	counter,
}) => {
	return (
		<Pressable
			disabled={disabled}
			onPress={onPress}
			style={({ pressed }) => [
				Array.isArray(style) ? [style[0], style[1]] : style,
				{ overflow: 'hidden', display: 'flex', flexDirection: 'row' },
				pressed && { backgroundColor: pressColor },
				disabled && { backgroundColor: '#BED0FE' },
			]}
		>
			<Text
				style={
					Array.isArray(textStyle)
						? [textStyle[0], textStyle[1]]
						: textStyle
				}
			>
				{text}
			</Text>
			{counter ? (
				<View style={styles.counter}>
					<Text style={styles.counter__text}>{counter} темы</Text>
				</View>
			) : (
				<></>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	counter: {
		height: 28,
		width: 66,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.2)',
		marginLeft: 10,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#fff',
	},
	counter__text: {
		color: '#fff',
		fontFamily: 'Hezaedrus500',
	},
});

export default Button;
