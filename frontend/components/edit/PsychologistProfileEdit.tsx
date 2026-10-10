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
import {
	getPsyshologistProfile,
	updatePsyshologistProfile,
	updatePsychologistPhoto,
} from '@/api/psychologists/psychologists';
import { Loading } from '@/components/custom/ui/Loading';

const genderMap: Record<string, Gender> = {
	NOT_STATED: Gender.NOT_STATED,
	MALE: Gender.MALE,
	FEMALE: Gender.FEMALE,
};

type FormState = {
	email: string;
	first_name: string;
	last_name: string;
	experience: string;
	price: string;
	age: number;
	gender: Gender;
	avatar: { uri: string } | null;
	avatarFile: any;
};

const PsychologistProfileEdit = () => {
	const [open, setOpen] = useState(false);
	const [visible, setVisible] = useState(false);
	const buttonMargin = useSharedValue(20);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [date, setDate] = useState(new Date());

	const [form, setForm] = useState<FormState>({
		email: '',
		first_name: '',
		last_name: '',
		experience: '',
		price: '',
		age: 0,
		gender: Gender.NOT_STATED,
		avatar: null,
		avatarFile: null,
	});

	useEffect(() => {
		init();
	}, []);

	const init = async () => {
		try {
			setLoading(true);
			const t = await getToken();
			setToken(t);
			if (!t) return;

			const res = await getPsyshologistProfile(t);

			setForm({
				email: res.email ?? '',
				first_name: res.first_name ?? '',
				last_name: res.last_name ?? '',
				experience: res.experience?.toString() ?? '',
				price: res.price?.toString() ?? '',
				age: res.age ?? 0,
				gender: genderMap[res.gender] ?? Gender.NOT_STATED,
				avatar: res.avatar ? { uri: res.avatar } : null,
				avatarFile: null,
			});

			if (res.age) {
				const birth = new Date();
				birth.setFullYear(birth.getFullYear() - res.age);
				setDate(birth);
			}
		} finally {
			setLoading(false);
		}
	};

	const calculateAge = (birth: Date) => {
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
		return age;
	};

	const handleDateConfirm = ({ date }: any) => {
		setVisible(false);
		if (!date) return;
		setDate(date);
		setForm((p) => ({ ...p, age: calculateAge(date) }));
	};

	const handleSelectGender = (value: Gender) => {
		setForm((p) => ({ ...p, gender: value }));
		setOpen(false);
		buttonMargin.value = withTiming(20);
	};

	const handleSelectOpen = (isOpen: boolean) => {
		setOpen(isOpen);
		buttonMargin.value = withTiming(isOpen ? 200 : 20);
	};

	const animatedButtonStyle = useAnimatedStyle(() => ({
		marginTop: buttonMargin.value,
	}));

	const pickImage = async () => {
		const mediaPerm =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!mediaPerm.granted) {
			Alert.alert('Нет доступа', 'Нужно разрешение к фото');
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			setForm((p) => ({
				...p,
				avatarFile: result.assets[0],
				avatar: { uri: result.assets[0].uri },
			}));
		}
	};

	const handleSubmit = async () => {
		if (!token) return;

		try {
			setLoading(true);

			if (form.avatarFile) {
				await updatePsychologistPhoto(token, form.avatarFile);
			}

			await updatePsyshologistProfile(token, {
				first_name: form.first_name,
				last_name: form.last_name,
				experience: Number(form.experience),
				price: Number(form.price),
				age: form.age,
				gender:
					Object.keys(genderMap).find(
						(k) => genderMap[k] === form.gender,
					) || 'NOT_STATED',
			});

			Alert.alert('Успех', 'Профиль обновлён');
		} catch (e) {
			console.log(e);
			Alert.alert('Ошибка', 'Не удалось сохранить профиль');
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <Loading />;

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
				date={date}
				label='Дата рождения'
				saveLabel='Установить'
				locale='ru-Ru'
			/>

			<View style={styles.container__header}>
				<Image
					source={
						form.avatar ?? require('@/assets/images/avatar.png')
					}
					style={styles.container__avatar}
				/>
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
						value={form.first_name}
						onChangeText={(v) =>
							setForm((p) => ({ ...p, first_name: v }))
						}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>

					<TextInput
						placeholder='Фамилия'
						style={styles.input}
						value={form.last_name}
						onChangeText={(v) =>
							setForm((p) => ({ ...p, last_name: v }))
						}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>
					<TextInput
						placeholder='Почта'
						style={styles.input}
						value={form.email}
						onChangeText={(v) =>
							setForm((p) => ({ ...p, email: v }))
						}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>
					<TextInput
						placeholder='Опыт'
						style={styles.input}
						value={form.experience}
						onChangeText={(v) =>
							setForm((p) => ({ ...p, experience: v }))
						}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>
					<TextInput
						placeholder='Стоимость'
						style={styles.input}
						value={form.price}
						onChangeText={(v) =>
							setForm((p) => ({ ...p, price: v }))
						}
						contentStyle={{ fontFamily: 'Hezaedrus' }}
						underlineColor='transparent'
						activeUnderlineColor='transparent'
						selectionColor='#3871FF'
						placeholderTextColor='rgba(1, 20, 67, 0.3)'
					/>
				</View>

				<View
					style={[
						styles.container__inputs,
						{ height: 100, marginTop: 10 },
					]}
				>
					<Pressable
						style={[styles.input, styles.label__style]}
						onPress={() => setVisible(true)}
					>
						<Text>Дата рождения</Text>
						<Text style={{ color: '#3565D9' }}>
							{formatDate(date)}
						</Text>
					</Pressable>

					<Select
						name='Ваш пол'
						isActive={!!form.gender}
						value={[form.gender]}
						options={genderOptions}
						onSelect={handleSelectOpen}
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
						onPress={handleSubmit}
						pressColor='#3565D9'
					/>
				</Animated.View>
			</View>
		</ScrollView>
	);
};

export default PsychologistProfileEdit;
