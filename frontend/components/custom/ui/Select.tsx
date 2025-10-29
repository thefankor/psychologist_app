import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useState } from 'react';
import { UI } from '@/types/ui';

export interface Option {
	label: any;
	value: string;
}

interface Props {
	name: string;
	value: any[];
	options: Option[];
	onSelect: (value: any) => void;
	isActive: boolean;
	font?: string;
}

export const Select = ({
	name,
	options,
	value = [],
	onSelect,
	isActive,
	font = 'Hezaedrus',
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const height = useSharedValue(0);
	const opacity = useSharedValue(0);

	const optionHeight = 48;
	const maxHeight = options.length * optionHeight;

	const toggleSelect = () => {
		const newIsOpen = !isOpen;
		setIsOpen(newIsOpen);

		if (newIsOpen) {
			height.value = withTiming(maxHeight, { duration: 200 });
			opacity.value = withTiming(1, { duration: 200 });
		} else {
			opacity.value = withTiming(0, { duration: 150 });
			height.value = withTiming(0, { duration: 250 });
		}
	};

	const handleSelect = (label: any) => {
		onSelect(label);
		setIsOpen(false);
		height.value = withTiming(0, { duration: 250 });
		opacity.value = withTiming(0, { duration: 150 });
	};

	const animatedStyle = useAnimatedStyle(() => ({
		height: height.value,
		opacity: opacity.value,
		overflow: 'hidden',
	}));

	const getDisplayValue = () => {
		if (value.length === 0) return 'Указать';
		const selectedOption = options.find((opt) => opt.label === value[0]);
		return selectedOption?.value || 'Указать';
	};

	return (
		<View style={styles.wrapper}>
			<Pressable
				onPress={toggleSelect}
				style={[styles.container, isOpen && styles.active]}
			>
				<View style={styles.row}>
					<Text style={[styles.label, { fontFamily: font }]}>
						{name}
					</Text>
					<Text
						style={[
							styles.value,
							isActive && value.length > 0 && styles.valueActive,
						]}
					>
						{getDisplayValue()}
					</Text>
				</View>
			</Pressable>

			<Animated.View style={[styles.list, animatedStyle]}>
				{options.map((item, idx) => (
					<Pressable
						key={idx}
						onPress={() => handleSelect(item.label)}
						style={[
							styles.item,
							value.includes(item.label) && styles.item__active,
						]}
					>
						<Text style={styles.item__text}>{item.value}</Text>
					</Pressable>
				))}
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		marginBottom: 16,
	},
	container: {
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 12,
		height: 50,
		justifyContent: 'center',
		paddingHorizontal: 16,
		backgroundColor: '#fff',
	},
	active: {
		borderColor: UI.colors.blue,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	label: {
		fontSize: 16,
		color: '#011443',
		fontFamily: 'Hezaedrus',
	},
	value: {
		fontSize: 16,
		fontFamily: 'Hezaedrus',
		color: '#0114434D',
	},
	valueActive: {
		color: '#3565D9',
	},
	list: {
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 12,
		marginTop: 4,
		backgroundColor: '#fff',
		overflow: 'hidden',
	},
	item: {
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	item__active: {
		backgroundColor: '#F0F3FF',
	},
	item__text: {
		color: '#011443',
		fontSize: 16,
		fontFamily: 'Hezaedrus',
	},
});
