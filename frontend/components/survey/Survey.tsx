import {
	Pressable,
	Text,
	TextInput,
	View,
	TouchableWithoutFeedback,
	Keyboard,
	ViewStyle,
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useEffect, useState } from 'react';
import { useKeyboard } from '@react-native-community/hooks';
import { styles } from './styles';
import { getToken } from '@/helpers/helper';
import { Select } from '@/components/custom/ui/Select';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/custom/ui/Button';
import { UI } from '@/types/ui';
import { genderOptions } from '@/types/types';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Loading } from '@/components/custom/ui/Loading';
import {
	getPsyshologistProfile,
	updatePsyshologistProfile,
} from '@/api/psychologists/psychologists';
import { methods } from '../form/form-step/methods';

export enum Gender {
	NOT_CHOOSEN = 0,
	NOT_STATED = 1,
	MALE = 2,
	FEMALE = 3,
}

const labelStyle = {
	paddingTop: 0,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingRight: 12,
} as ViewStyle;

export const Survey = () => {
	const router = useRouter();
	const { email } = useLocalSearchParams<{ email: string }>();

	const [date, setDate] = useState(new Date());
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);

	const [focusedFirstName, setFocusedFirstName] = useState(false);
	const [focusedLastName, setFocusedLastName] = useState(false);
	const [focusedExperience, setFocusedExperience] = useState(false);
	const [focusedPrice, setFocusedPrice] = useState(false);

	const [formState, setFormState] = useState({
		first_name: '',
		last_name: '',
		gender: Gender.NOT_CHOOSEN,
		birthDate: 'Указать',
		methods: [] as string[],
		experience: '',
		price: '',
	});

	useEffect(() => {
		//checkData();
	}, []);

	const checkData = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			const res = await getPsyshologistProfile(token!);

			if (res.first_name) {
				router.push('/profile');
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};
	const keyboard = useKeyboard();

	const calculateData = (birthDate: Date) => {
		const currentDate = new Date().getTime();
		const birthSeconds = birthDate.getTime();

		const age = Math.floor(
			(currentDate - birthSeconds) / (365 * 24 * 60 * 60 * 1000),
		);

		return age === 0 ? 'Указать' : age;
	};

	const onConfirm = ({ date }: any) => {
		setVisible(false);
		setDate(date);
		setFormState((prev) => ({
			...prev,
			birthDate: date,
		}));
	};

	const handleSelect = (genderValue: Gender) => {
		setFormState((prev) => ({
			...prev,
			gender: genderValue,
		}));
	};

	const handleMethodSelect = (value: string) => {
		setFormState((prev) => {
			const current = prev.methods;
			console.log(current);
			return {
				...prev,
				methods: current.includes(value)
					? current.filter((m) => m !== value)
					: [...current, value.toUpperCase()],
			};
		});
	};

	const formatMethodSelection = (selected: string[]) => {
		return selected
			.map((method) => {
				const found = methods.find((m) => m.label === method);
				return found ? found.value : method;
			})
			.join(', ');
	};

	const sendData = async () => {
		if (
			!formState.first_name.trim() ||
			!formState.last_name.trim() ||
			formState.gender === Gender.NOT_CHOOSEN ||
			formState.birthDate === 'Указать' ||
			formState.methods.length === 0 ||
			!formState.experience.trim() ||
			!formState.price.trim()
		) {
			return;
		}

		setLoading(true);
		try {
			const token = await getToken();
			if (!token) return;

			const ageValue =
				typeof formState.birthDate === 'string'
					? 0
					: calculateData(formState.birthDate);

			const payload = {
				email,
				first_name: formState.first_name.trim(),
				last_name: formState.last_name.trim(),
				methods: formState.methods,
				experience: Number(formState.experience),
				price: Number(formState.price),
				age: ageValue === 'Указать' ? 0 : ageValue,
				gender: Gender[formState.gender] || 'NOT_STATED',
			};

			await updatePsyshologistProfile(token, payload);

			router.push('/profile');
		} catch (err) {
			console.log('Ошибка сохранения профиля психолога:', err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View
				style={[
					styles.container,
					{ paddingBottom: keyboard.keyboardHeight + 70 },
				]}
			>
				<StatusBar style='dark' />
				<DatePickerModal
					mode='single'
					visible={visible}
					onConfirm={onConfirm}
					onDismiss={() => setVisible(false)}
					date={date}
					label='Выберите дату рождения'
					saveLabel='Установить'
					animationType='fade'
					locale='ru-Ru'
				/>

				<View style={styles.inputs__wrap}>
					<Text style={styles.container__title}>
						Расскажите о себе
					</Text>

					<View style={styles.input__wrap}>
						<TextInput
							style={[
								styles.input,
								focusedFirstName && styles.active,
							]}
							value={formState.first_name}
							cursorColor={UI.colors.blue}
							onFocus={() => setFocusedFirstName(true)}
							placeholder={focusedFirstName ? '' : 'Имя'}
							placeholderTextColor={UI.colors.mediumBlue}
							onBlur={() => setFocusedFirstName(false)}
							onChangeText={(text) =>
								setFormState((prev) => ({
									...prev,
									first_name: text,
								}))
							}
						/>
					</View>

					<View style={styles.input__wrap}>
						<TextInput
							style={[
								styles.input,
								focusedLastName && styles.active,
							]}
							value={formState.last_name}
							cursorColor={UI.colors.blue}
							onFocus={() => setFocusedLastName(true)}
							placeholder={focusedLastName ? '' : 'Фамилия'}
							placeholderTextColor={UI.colors.mediumBlue}
							onBlur={() => setFocusedLastName(false)}
							onChangeText={(text) =>
								setFormState((prev) => ({
									...prev,
									last_name: text,
								}))
							}
						/>
					</View>

					<Pressable
						style={[styles.input, labelStyle]}
						onPress={() => setVisible(true)}
					>
						<Text style={{ fontFamily: 'Hezaedrus' }}>
							Ваш возраст
						</Text>
						<Text
							style={{
								fontFamily: 'Hezaedrus',
								color:
									formState.birthDate === 'Указать'
										? '#0114434D'
										: '#3565D9',
							}}
						>
							{typeof formState.birthDate === 'string'
								? formState.birthDate
								: JSON.stringify(
										calculateData(formState.birthDate),
									).replaceAll('"', '')}
						</Text>
					</Pressable>

					<View style={{ gap: 12 }}>
						<Select
							name='Ваш пол'
							isActive={formState.gender !== Gender.NOT_CHOOSEN}
							value={
								formState.gender !== Gender.NOT_CHOOSEN
									? [formState.gender]
									: []
							}
							options={genderOptions}
							onSelect={handleSelect}
							maxHeight={160}
							setOpen={setOpen}
							selectStyle={styles.select__container}
							font='Hezaedrus'
						/>

						<Select
							name='Методы работы'
							options={methods}
							value={formState.methods}
							onSelect={handleMethodSelect}
							isActive={formState.methods.length > 0}
							setOpen={setOpen}
							font='Hezaedrus'
							displayFormatter={formatMethodSelection}
							maxHeight={300}
						/>
					</View>

					<View style={styles.input__wrap}>
						<TextInput
							style={[
								styles.input,
								focusedExperience && styles.active,
							]}
							placeholder={focusedExperience ? '' : 'Стаж работы'}
							placeholderTextColor={UI.colors.mediumBlue}
							keyboardType='numeric'
							value={formState.experience}
							cursorColor={UI.colors.blue}
							onFocus={() => setFocusedExperience(true)}
							onBlur={() => setFocusedExperience(false)}
							onChangeText={(text) =>
								setFormState((prev) => ({
									...prev,
									experience: text,
								}))
							}
						/>
					</View>

					<View style={styles.input__wrap}>
						<TextInput
							style={[
								styles.input,
								focusedPrice && styles.active,
							]}
							placeholder={focusedPrice ? '' : 'Стоимость сессии'}
							placeholderTextColor={UI.colors.mediumBlue}
							keyboardType='numeric'
							value={formState.price}
							cursorColor={UI.colors.blue}
							onFocus={() => setFocusedPrice(true)}
							onBlur={() => setFocusedPrice(false)}
							onChangeText={(text) =>
								setFormState((prev) => ({
									...prev,
									price: text,
								}))
							}
						/>
					</View>
				</View>

				<Button
					disabled={
						!formState.first_name.trim() ||
						!formState.last_name.trim() ||
						formState.gender === Gender.NOT_CHOOSEN ||
						formState.birthDate === 'Указать' ||
						formState.methods.length === 0 ||
						!formState.experience.trim() ||
						!formState.price.trim()
					}
					text='Завершить'
					onPress={sendData}
					style={UI.styles.continueButton}
					textStyle={UI.styles.continueText}
					pressColor={UI.colors.pressableColor}
				/>
			</View>
		</TouchableWithoutFeedback>
	);
};
