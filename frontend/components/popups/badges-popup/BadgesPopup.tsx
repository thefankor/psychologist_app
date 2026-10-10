import React, { useRef, useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Modal,
	Animated,
	Easing,
	Text,
	Dimensions,
	Pressable,
} from 'react-native';
import { styles } from './styles';
import * as NavigationBar from 'expo-navigation-bar';
import { FormBlock } from '@/components/form/form-block/FormBlock';
import { Button } from '@/components/custom/ui/Button';
import { DefaultLabel, FormData } from '@/types/types';
import { UI } from '@/types/ui';
import usePopup from '@/helpers/hooks/usePopup';

const { height } = Dimensions.get('window');

interface Props {
	visible: boolean;
	setVisible: (state: boolean) => void;
	setFormData: (state: FormData) => void;
	activeLabel: DefaultLabel | null;
	formData: FormData;
}

const compareNames = [
	{ name: 'Эмоциональное состояние', label: 'emotions' },
	{ name: 'Отношения', label: 'relations' },
	{ name: 'Работа, учёба', label: 'work' },
	{ name: 'Жизненные обстоятельства', label: 'life' },
	{ name: 'Личностное развитие', label: 'personal' },
];

const BADGES_BY_CATEGORY: Record<DefaultLabel, string[]> = {
	emotions: ['Тревога', 'Апатия', 'Грусть', 'Раздражительность', 'Выгорание'],

	relations: [
		'Конфликты с партнёром',
		'Одиночество / нехватка близости',
		'Сложности с родителями',
		'Проблемы с друзьями / окружением',
		'Ревность / недоверие',
	],

	work: [
		'Выгорание на работе / учёбе',
		'Страх провала / неуспеха',
		'Перегрузка / постоянные дедлайны',
		'Конфликты с коллегами / руководством',
		'Потеря интереса к делу',
	],

	life: [
		'Финансовые трудности',
		'Переезд / смена места жительства',
		'Потеря близкого человека',
		'Проблемы со здоровьем',
		'Неопределённость в будущем',
	],

	personal: [
		'Низкая самооценка',
		'Прокрастинация',
		'Поиск смысла / цели в жизни',
		'Страх перемен',
		'Перфекционизм',
	],
};

export const BadgesPopup = ({
	visible,
	setVisible,
	activeLabel,
	setFormData,
	formData,
}: Props) => {
	const { panResponder } = usePopup();
	const translateY = useRef(new Animated.Value(height)).current;
	const [internalVisible, setInternalVisible] = useState(false);
	const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
	const isAnimating = useRef(false);
	const opacity = useRef(new Animated.Value(0)).current;

	const currentBadges = activeLabel
		? BADGES_BY_CATEGORY[activeLabel] || []
		: [];

	useEffect(() => {
		if (visible && !internalVisible) {
			setInternalVisible(true);

			if (activeLabel && formData[activeLabel]) {
				setSelectedParameters(formData[activeLabel] as string[]);
			} else {
				setSelectedParameters([]);
			}

			translateY.setValue(height);
			opacity.setValue(0);

			setTimeout(() => {
				isAnimating.current = true;
				Animated.parallel([
					Animated.timing(translateY, {
						toValue: 0,
						duration: 300,
						easing: Easing.out(Easing.ease),
						useNativeDriver: true,
					}),
					Animated.timing(opacity, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}),
				]).start(() => {
					isAnimating.current = false;
				});
			}, 10);
		} else if (!visible && internalVisible) {
			isAnimating.current = true;
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: height,
					duration: 250,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
				}),
			]).start(() => {
				setInternalVisible(false);
				isAnimating.current = false;
			});
		}

		if (visible) {
			NavigationBar.setVisibilityAsync('hidden');
		}
	}, [visible, activeLabel, formData]);

	const handleParameterToggle = (parameter: string) => {
		setSelectedParameters((prev) => {
			if (prev.includes(parameter)) {
				return prev.filter((item) => item !== parameter);
			} else {
				return [...prev, parameter];
			}
		});
	};

	const handleSave = () => {
		if (activeLabel) {
			const updatedFormData: FormData = {
				...formData,
				[activeLabel]: selectedParameters,
			};
			setFormData(updatedFormData);
		}
		handleClose();
	};

	const handleClose = () => {
		if (isAnimating.current) return;

		isAnimating.current = true;
		Animated.parallel([
			Animated.timing(translateY, {
				toValue: height,
				duration: 250,
				easing: Easing.in(Easing.ease),
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
		]).start(() => {
			setInternalVisible(false);
			setVisible(false);
			isAnimating.current = false;
		});
		NavigationBar.setVisibilityAsync('visible');
	};

	const handleResetAndClose = () => {
		setSelectedParameters([]);

		if (activeLabel) {
			const updatedFormData: FormData = {
				...formData,
				[activeLabel]: [],
			};
			setFormData(updatedFormData);
		}

		handleClose();
	};

	if (!internalVisible) return null;

	return (
		<Modal
			visible={internalVisible}
			transparent
			animationType='none'
			onRequestClose={handleResetAndClose}
			statusBarTranslucent
		>
			<Animated.View style={[styles.modalOverlay, { opacity }]}>
				<TouchableOpacity
					style={styles.overlay}
					onPress={handleResetAndClose}
					activeOpacity={1}
				/>

				<Animated.View
					style={[
						styles.modalContent,
						{ transform: [{ translateY }] },
					]}
					{...panResponder.panHandlers}
				>
					<View style={styles.swipeIndicator} />

					<View style={styles.popup__container}>
						<Text style={styles.popup__title}>
							{compareNames.find(
								(item) => item.label === activeLabel,
							)?.name || 'Выберите тему'}
						</Text>

						<View style={styles.popup__blocks}>
							{currentBadges.map((badge) => (
								<FormBlock
									key={badge}
									checkbox
									title={badge}
									isActive={selectedParameters.includes(
										badge,
									)}
									onPress={() => handleParameterToggle(badge)}
								/>
							))}

							{currentBadges.length === 0 && (
								<Text
									style={{
										textAlign: 'center',
										color: '#888',
										marginTop: 20,
										fontSize: 16,
									}}
								>
									Нет доступных вариантов для этой категории
								</Text>
							)}
						</View>

						<Button
							counter={selectedParameters.length}
							text='Сохранить'
							style={UI.styles.continueButton}
							textStyle={UI.styles.continueText}
							pressColor={UI.colors.pressableColor}
							onPress={handleSave}
						/>

						<Pressable
							style={styles.reset__btn}
							onPress={handleResetAndClose}
						>
							<Text style={styles.reset__text}>Сбросить</Text>
						</Pressable>
					</View>
				</Animated.View>
			</Animated.View>
		</Modal>
	);
};
