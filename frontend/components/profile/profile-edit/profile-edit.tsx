import { View, Image, Pressable, Text, ScrollView, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { styles } from './styles';
import { TextInput } from 'react-native-paper';
import { genderOptions, Gender } from '@/types/types';
import { DatePickerModal } from 'react-native-paper-dates';
import { formatDate, getToken } from '@/helpers/helper';
import { UI } from '@/types/ui';
import { Button, Select } from '@/components/custom';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { getUser, updateUser, updateUserPhoto } from '@/api/profile/profile';

const genderMap: Record<string, Gender> = {
	NOT_STATED: Gender.NOT_STATED,
	MALE: Gender.MALE,
	FEMALE: Gender.FEMALE,
};

const ProfileEdit = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [visible, setVisible] = useState(false);
	const buttonMargin = useSharedValue(20);
	const [token, setToken] = useState<string | null>(null);
	const [settingsUpdate, setSettingsUpdate] = useState<{
		name: string;
		phone: string;
		email: string;
		gender: Gender;
		birth_date: Date;
		avatar: { uri: string } | null;
		avatarFile: any;
	}>({
		name: '',
		phone: '',
		email: '',
		gender: Gender.NOT_STATED,
		birth_date: new Date(),
		avatar: null,
		avatarFile: null,
	});

	useEffect(() => {
		getUserData();
	}, []);

	const getUserData = async () => {
		const token = await getToken();
		setToken(token);
		if (token) {
			const res = await getUser(token);
			setSettingsUpdate({
				name: res.name ?? '',
				phone: res.phone ?? '',
				email: res.email ?? '',
				gender: genderMap[res.gender] ?? Gender.NOT_STATED,
				birth_date: res.birth_date
					? new Date(res.birth_date)
					: new Date(),
				avatar: res.avatar
					? { uri: res.avatar }
					: require('@/assets/images/avatar.png'),
				avatarFile: null,
			});
		}
	};

	const handleChange = (field: string, value: any) => {
		setSettingsUpdate((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSelect = (genderValue: any) => {
		handleChange('gender', genderValue);
		setOpen(false);
		buttonMargin.value = withTiming(20, { duration: 300 });
	};

	const handleSelectOpen = (isOpen: boolean) => {
		setOpen(isOpen);
		buttonMargin.value = withTiming(isOpen ? 200 : 20, { duration: 300 });
	};

	const handleDateConfirm = ({ date }: { date: any }) => {
		setVisible(false);
		if (date) handleChange('birth_date', date);
	};

	const animatedButtonStyle = useAnimatedStyle(() => ({
		marginTop: buttonMargin.value,
	}));

	const isValidPhone = (phone: string) => {
		const regex = /^\+7\d{10}$/;
		return regex.test(phone);
	};

	const pickImage = async () => {
		const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
		const mediaPerm =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!cameraPerm.granted || !mediaPerm.granted) {
			Alert.alert(
				'Нет доступа',
				'Нужно разрешение на доступ к камере и фото'
			);
			return;
		}

		Alert.alert(
			'Выберите фото',
			'Камера или галерея?',
			[
				{
					text: 'Камера',
					onPress: async () => {
						const result = await ImagePicker.launchCameraAsync({
							mediaTypes: ImagePicker.MediaTypeOptions.Images,
							allowsEditing: true,
							aspect: [1, 1],
							quality: 0.8,
						});
						if (!result.canceled) setAvatarFile(result.assets[0]);
					},
				},
				{
					text: 'Галерея',
					onPress: async () => {
						const result =
							await ImagePicker.launchImageLibraryAsync({
								mediaTypes: ImagePicker.MediaTypeOptions.Images,
								allowsEditing: true,
								aspect: [1, 1],
								quality: 0.8,
							});
						if (!result.canceled) setAvatarFile(result.assets[0]);
					},
				},
				{ text: 'Отмена', style: 'cancel' },
			],
			{ cancelable: true }
		);
	};

	const setAvatarFile = (file: any) => {
		setSettingsUpdate((prev) => ({
			...prev,
			avatarFile: file,
			avatar: { uri: file.uri },
		}));
	};

	const updateUserData = async () => {
		if (!token) return;

		if (!isValidPhone(settingsUpdate.phone)) {
			Alert.alert(
				'Ошибка',
				'Неверный номер телефона. Формат: +7XXXXXXXXXX'
			);
			return;
		}

		try {
			if (settingsUpdate.avatarFile) {
				const uploaded = await updateUserPhoto(
					token,
					settingsUpdate.avatarFile
				);
				if (uploaded?.image) {
					handleChange('avatar', { uri: uploaded.image });
					handleChange('avatarFile', null);
				}
			}

			const payload = {
				name: settingsUpdate.name,
				phone: settingsUpdate.phone,
				email: settingsUpdate.email,
				gender:
					Object.keys(genderMap).find(
						(key) => genderMap[key] === settingsUpdate.gender
					) || 'NOT_STATED',
				birth_date: settingsUpdate.birth_date
					? settingsUpdate.birth_date.toISOString()
					: null,
				timezone: 'UTC_12_M',
			};

			await updateUser(token, payload);
			Alert.alert('Успех', 'Профиль успешно обновлен');
		} catch (error) {
			console.log('Ошибка при обновлении профиля:', error);
			Alert.alert('Ошибка', 'Не удалось обновить профиль');
		}
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: open ? 200 : 100 }}
		>
			<DatePickerModal
				mode='single'
				visible={visible}
				onConfirm={handleDateConfirm}
				onDismiss={() => setVisible(false)}
				date={settingsUpdate.birth_date}
				label='Выберите дату рождения'
				saveLabel='Установить'
				animationType='fade'
				locale='ru-Ru'
			/>

			<View style={styles.container__header}>
				{settingsUpdate.avatar ? (
					<Image
						source={settingsUpdate.avatar}
						style={styles.container__avatar}
					/>
				) : (
					<View style={styles.container__avatar} />
				)}
				<Pressable onPress={pickImage}>
					<Text style={styles.container__text}>
						Изменить фотографию
					</Text>
				</Pressable>
			</View>

			<View style={styles.container__body}>
				<View style={styles.container__inputs}>
					<TextInput
						placeholder='Имя'
						style={styles.input}
						value={settingsUpdate.name}
						onChangeText={(text) => handleChange('name', text)}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>

					<TextInput
						placeholder='+7 999 999 99 99'
						style={[styles.input]}
						value={settingsUpdate.phone}
						onChangeText={(text) => handleChange('phone', text)}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
						keyboardType='phone-pad'
					/>

					<TextInput
						placeholder='Почта'
						style={styles.input}
						value={settingsUpdate.email}
						onChangeText={(text) => handleChange('email', text)}
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						contentStyle={{ fontFamily: 'Hezaedrus' }}
					/>
				</View>

				<View
					style={[
						styles.container__inputs,
						{ marginTop: 20, height: 100 },
					]}
				>
					<Pressable
						style={[styles.input, styles.label__style]}
						onPress={() => setVisible(true)}
					>
						<Text style={{ fontFamily: 'Hezaedrus' }}>
							Дата рождения
						</Text>
						<Text
							style={{
								fontFamily: 'Hezaedrus',
								color: '#3565D9',
							}}
						>
							{formatDate(settingsUpdate.birth_date)}
						</Text>
					</Pressable>

					<Select
						name='Ваш пол'
						isActive={!!settingsUpdate.gender}
						value={[settingsUpdate.gender]}
						options={genderOptions}
						onSelect={handleSelect}
						maxHeight={160}
						setOpen={handleSelectOpen}
						opened={open}
						selectStyle={styles.selectContainer}
						font='Hezaedrus'
					/>
				</View>

				<Animated.View style={animatedButtonStyle}>
					<Button
						text='Сохранить изменения'
						style={UI.styles.continueButton}
						textStyle={styles.button__text}
						pressColor='#3565D9'
						onPress={updateUserData}
					/>
				</Animated.View>
			</View>
		</ScrollView>
	);
};

export default ProfileEdit;
