import { View, Text, Pressable, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/custom/ui/CheckBox';
import { UI } from '@/types/ui';
import { FormSteps } from '@/types/types';

export interface Option {
	label: any;
	value: string;
}

interface Props {
	name: string | number;
	value: any[];
	options: Option[];
	onSelect: (value: any) => void;
	selectStyle?: ViewStyle;
	headerStyle?: ViewStyle;
	maxHeight?: number;
	isActive: boolean;
	isCheckbox?: boolean;
	hide?: boolean;
	setOpen?: (open: boolean) => void;
	opened?: boolean;
	font?: string;
	type?: boolean;
	step?: FormSteps;
	displayFormatter?: (selected: any[], options: Option[]) => string;
}

export const Select = ({
	name,
	options,
	value = [],
	onSelect,
	selectStyle,
	maxHeight = 200,
	isActive,
	isCheckbox,
	hide,
	setOpen,
	opened,
	type,
	displayFormatter,
	headerStyle,
	font,
	step,
}: Props) => {
	const [isOpen, setIsOpen] = useState(false);
	const height = useSharedValue(0);
	const rotation = useSharedValue(0);
	const padding = useSharedValue(0);
	const opacity = useSharedValue(0);

	const toggleSelect = () => {
		const newIsOpen = !isOpen;
		setIsOpen(newIsOpen);
		setOpen?.(newIsOpen);

		if (newIsOpen) {
			height.value = withTiming(
				newIsOpen ? (isCheckbox ? 370 : maxHeight) : 0,
				{
					duration: 300,
				}
			);
			padding.value = withTiming(12, { duration: 250 });
			opacity.value = withTiming(1, { duration: 250 });
		} else {
			padding.value = withTiming(0, { duration: 200 });
			opacity.value = withTiming(0, { duration: 150 });
			height.value = withTiming(0, { duration: 300 });
		}

		rotation.value = withTiming(newIsOpen ? 180 : 0, { duration: 300 });
	};

	useEffect(() => {
		if (opened === false) {
			setIsOpen(false);
			padding.value = withTiming(0, { duration: 200 });
			opacity.value = withTiming(0, { duration: 150 });
			height.value = withTiming(0, { duration: 300 });
			rotation.value = withTiming(0, { duration: 300 });
		}
	}, [opened]);

	const handleSelect = (label: any) => {
		onSelect(label);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		height: height.value,
		paddingTop: step === FormSteps.STEP_SIX ? 0 : padding.value,
		paddingBottom: padding.value,

		opacity: opacity.value,
		overflow: 'hidden',
	}));

	const getDisplayValue = () => {
		if (value.length === 0) return 'Указать';

		if (displayFormatter) {
			return displayFormatter(value, options);
		}

		if (!isCheckbox) {
			const selectedOption = options.find(
				(opt) => opt.label === value[0]
			);
			return selectedOption?.value || 'Указать';
		}

		return value
			.map((v) => {
				const option = options.find((o) => o.label === v);
				return option?.value || '';
			})
			.filter(Boolean)
			.join(', ');
	};

	return (
		<View style={[styles.wrapper, selectStyle]}>
			<Pressable
				onPress={toggleSelect}
				style={[
					styles.container,
					isOpen && isCheckbox
						? { borderColor: '#3871FF', borderWidth: 1.5 }
						: null,
					isCheckbox && { maxHeight: 550 },
					selectStyle,
					isOpen && styles.active,
				]}
			>
				<View
					style={[
						styles.header,
						isCheckbox && {
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							paddingRight: 36,
						},
						headerStyle,
					]}
				>
					<>
						<View style={styles.container__wrap}>
							<Text
								style={[
									styles.select__name,
									{ fontFamily: font },
								]}
							>
								{name}
							</Text>
							{hide || (
								<Text
									style={[
										styles.select__value,
										isActive &&
											value.length > 0 &&
											styles.select__active,
									]}
									numberOfLines={1}
									ellipsizeMode='tail'
								>
									{getDisplayValue()}
								</Text>
							)}
						</View>

						{isOpen && !isCheckbox && (
							<View style={styles.container__line} />
						)}
					</>
					{isCheckbox && <Checkbox isActive={isOpen} radio />}
				</View>

				<Animated.View
					style={[
						styles.list,
						animatedStyle,
						isCheckbox && { gap: 0 },
						step === FormSteps.STEP_SIX && {
							gap: 0,
						},
					]}
				>
					{options.map((item, idx) => (
						<View key={idx}>
							{type ? null : (
								<>
									{isCheckbox && idx === 0 && (
										<Text style={styles.subtitle}>
											Будни
										</Text>
									)}
									{isCheckbox && idx === 3 && (
										<Text style={styles.subtitle}>
											Выходные
										</Text>
									)}
								</>
							)}

							<Pressable
								onPress={() => handleSelect(item.label)}
								style={[
									styles.item,
									value.includes(item.label) &&
										styles.item__active,
									isCheckbox && {
										marginTop: 8,
										marginLeft: 16,
									},
									isCheckbox &&
										idx === 2 &&
										step === FormSteps.STEP_FIVE && {
											marginBottom: 20,
										},
								]}
							>
								<Text style={styles.item__text}>
									{item.value}
								</Text>
							</Pressable>
						</View>
					))}
				</Animated.View>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
	},
	container: {
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 16,
		height: 'auto',
		overflow: 'hidden',
	},
	header: {
		padding: 12,
		height: 50,
	},
	active: {
		borderWidth: 1,
		borderColor: UI.colors.blue,
	},

	container__wrap: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		height: '100%',
		justifyContent: 'space-between',
	},
	container__line: {
		width: '100%',
		marginTop: 12,
		height: 1,
		backgroundColor: UI.colors.lightBlue,
	},
	select__name: {
		color: UI.colors.defaultBlue,
		fontFamily: 'Hezaedrus500',
	},
	select__value: {
		fontFamily: 'Hezaedrus',
		color: '#0114434D',
	},
	select__active: {
		color: '#3565D9',
		fontFamily: 'Hezaedrus',
	},
	list: {
		minWidth: '100%',
		gap: 8,
		height: 'auto',
	},
	item: {
		padding: 12,
		borderRadius: 8,
		marginLeft: 16,

		marginRight: 16,
	},
	item__active: {
		backgroundColor: '#F0F3FF',
	},
	item__text: {
		color: UI.colors.defaultBlue,
		fontFamily: 'Hezaedrus',
	},
	subtitle: {
		color: 'rgba(1, 20, 67, 0.6)',
		fontFamily: 'Hezaedrus',
		left: 16,
	},
});
