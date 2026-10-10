import {
	View,
	Text,
	Image,
	Pressable,
	Alert,
	Modal,
	TextInput,
} from 'react-native';
import { styles } from './styles';
import { Button } from '@/components/custom';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Psychologist } from '@/types/types';
import {
	addToFavorite,
	deleteFavoritePsychologist,
	createAppointment,
} from '@/api/psychologists/psychologists';
import { useState } from 'react';
import { formatMethods, getToken } from '@/helpers/helper';
import { Loading } from '@/components/custom/ui/Loading';

interface PsychologistCardProps {
	psychologist: Psychologist;
	isFavorite: boolean;
	onFavoriteToggle: (id: number) => void;
}

export const PsychologistCard = ({
	psychologist,
	isFavorite,
	onFavoriteToggle,
}: PsychologistCardProps) => {
	const {
		id,
		first_name,
		last_name,
		methods,
		rating,
		price,
		experience,
		matches_count,
		avatar,
	} = psychologist;
	const [prevInput, setPrevInput] = useState('');

	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [dateInput, setDateInput] = useState('');

	const fullName = `${first_name} ${last_name}`;
	const isArsen = fullName === 'Арсен Маркарян';
	const methodsString = formatMethods(methods);

	const avatarSource = avatar
		? { uri: avatar }
		: require('@/assets/images/ad.png');

	const heartSource = isFavorite
		? require('@/assets/images/heart-filled.png')
		: require('@/assets/images/heart-outline.png');

	const handleFavoritePress = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			if (!token) return;

			if (isFavorite) {
				await deleteFavoritePsychologist(token, id);
			} else {
				await addToFavorite(token, id);
			}
			onFavoriteToggle(id);
		} finally {
			setLoading(false);
		}
	};

	const openBookingModal = () => {
		if (isArsen) return;
		setDateInput('');
		setModalVisible(true);
	};

	const formatDateInput = (value: string) => {
		if (value.length < prevInput.length) {
			setPrevInput(value);
			return value;
		}

		const digits = value.replace(/\D/g, '').slice(0, 12);
		let result = '';

		if (digits.length <= 2) {
			result = digits;
			if (digits.length === 2) result += '.';
		} else if (digits.length <= 4) {
			result = `${digits.slice(0, 2)}.${digits.slice(2)}`;
			if (digits.length === 4) result += '.';
		} else if (digits.length <= 8) {
			result = `${digits.slice(0, 2)}.${digits.slice(
				2,
				4,
			)}.${digits.slice(4)}`;
			if (digits.length === 8) result += ' ';
		} else if (digits.length <= 10) {
			result = `${digits.slice(0, 2)}.${digits.slice(
				2,
				4,
			)}.${digits.slice(4, 8)} ${digits.slice(8)}`;
			if (digits.length === 10) result += ':';
		} else {
			result = `${digits.slice(0, 2)}.${digits.slice(
				2,
				4,
			)}.${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(
				10,
			)}`;
		}

		setPrevInput(result);
		return result;
	};

	const parseDate = (value: string) => {
		const match = value.match(
			/^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/,
		);
		if (!match) return null;

		const dd = Number(match[1]);
		const mm = Number(match[2]);
		const yyyy = Number(match[3]);
		const hh = Number(match[4]);
		const min = Number(match[5]);

		const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);

		if (
			date.getFullYear() !== yyyy ||
			date.getMonth() !== mm - 1 ||
			date.getDate() !== dd ||
			date.getHours() !== hh ||
			date.getMinutes() !== min
		) {
			return null;
		}

		if (date <= new Date()) return null;

		return date;
	};

	const confirmAppointment = async () => {
		const parsedDate = parseDate(dateInput);

		if (!parsedDate) {
			Alert.alert(
				'Ошибка',
				'Введите корректную будущую дату в формате ДД.ММ.ГГГГ ЧЧ:ММ',
			);
			return;
		}

		try {
			setLoading(true);
			const token = await getToken();
			if (!token) {
				Alert.alert('Ошибка', 'Не авторизован');
				return;
			}

			await createAppointment(token, id, parsedDate.toISOString());

			Alert.alert(
				'Вы успешно записались!',
				parsedDate.toLocaleString('ru-RU'),
			);
			setModalVisible(false);
		} catch (e: any) {
			Alert.alert('Ошибка', e.message || 'Не удалось записаться');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<>
			<Animated.View
				entering={FadeInDown.duration(600)}
				style={styles.container}
			>
				<Pressable style={styles.pressable}>
					<View style={styles.card}>
						<View style={styles.bgCircle} />

						<View style={styles.avatarContainer}>
							<Image
								source={avatarSource}
								style={styles.avatar}
							/>

							<View style={styles.ratingBadge}>
								<Image
									source={require('@/assets/images/star-filled.png')}
									style={styles.starIcon}
								/>
								<Text style={styles.ratingText}>
									{rating.toFixed(1)}
								</Text>
							</View>

							<Pressable
								style={styles.favoriteButton}
								onPress={handleFavoritePress}
							>
								<Image
									source={heartSource}
									style={styles.heartIcon}
								/>
							</Pressable>
						</View>

						<View style={styles.info}>
							<Text style={styles.name}>{fullName}</Text>
							<Text style={styles.methods}>
								{methodsString || 'Методы не указаны'}
							</Text>

							<View style={styles.priceRow}>
								{isArsen ? (
									<Text style={styles.price}>Бесценно</Text>
								) : (
									<>
										<Text style={styles.priceLabel}>
											от
										</Text>
										<Text style={styles.price}>
											{price != null
												? price.toLocaleString('ru')
												: '—'}
										</Text>
										<Text style={styles.priceLabel}>₽</Text>
									</>
								)}
							</View>

							<View style={styles.stats}>
								<View style={styles.statItem}>
									<View style={styles.flagButton}>
										<Image
											source={require('@/assets/images/flag.png')}
											style={styles.statIcon}
										/>
									</View>
									<Text style={styles.statText}>
										{matches_count} из 5 тем
									</Text>
								</View>
								<View style={styles.statItem}>
									<View style={styles.flagButton}>
										<Image
											source={require('@/assets/images/briefcase.png')}
											style={styles.statIcon}
										/>
									</View>
									<Text style={styles.statText}>
										{experience} лет опыта
									</Text>
								</View>
							</View>

							<Button
								text={
									isArsen
										? 'Записаться невозможно'
										: 'Записаться'
								}
								pressColor='#3a6bf5'
								disabled={isArsen}
								style={styles.bookButton}
								textStyle={styles.bookButtonText}
								onPress={openBookingModal}
							/>
						</View>
					</View>
				</Pressable>
			</Animated.View>

			<Modal transparent visible={modalVisible} animationType='fade'>
				<View style={styles.modalOverlay}>
					<View style={styles.modalBox}>
						<Text style={styles.modalTitle}>Дата и время</Text>

						<TextInput
							value={dateInput}
							onChangeText={(text) =>
								setDateInput(formatDateInput(text))
							}
							placeholder='ДД.ММ.ГГГГ ЧЧ:ММ'
							placeholderTextColor='#999'
							style={styles.modalInput}
							keyboardType='numeric'
							maxLength={16}
						/>

						<View style={styles.modalButtonsRow}>
							<Button
								pressColor='#dbdee4ff'
								text='Отмена'
								style={styles.modalBtn}
								textStyle={styles.modalBtnText}
								onPress={() => setModalVisible(false)}
							/>
							<Button
								pressColor='#3a6bf5'
								text='Записаться'
								textStyle={styles.modalBtnPrimaryText}
								style={styles.modalBtnPrimary}
								onPress={confirmAppointment}
							/>
						</View>
					</View>
				</View>
			</Modal>
		</>
	);
};
