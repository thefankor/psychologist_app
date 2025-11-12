import { View, Image, Pressable, Text, ScrollView } from 'react-native';
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
import { getUser, updateUser } from '@/api/profile/profile';

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
	const [settingsUpdate, setSettingsUpdate] = useState({
		name: '',
		phone: '',
		email: '',
		gender: Gender.NOT_STATED,
		birth_date: new Date(),
		avatar: null,
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
				avatar: require('@/assets/images/avatar.png'),
			});
		}
	};

	const updateUserData = async () => {
		if (!token) return;

		try {
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
			console.log('Профиль успешно обновлён');
		} catch (error) {
			console.log('Ошибка при обновлении профиля:', error);
		}
	};

	const handleDateConfirm = ({ date }: { date: any }) => {
		setVisible(false);
		if (date) {
			setSettingsUpdate((prev) => ({
				...prev,
				birth_date: date,
			}));
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

	const animatedButtonStyle = useAnimatedStyle(() => ({
		marginTop: buttonMargin.value,
	}));

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
				<Pressable>
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
