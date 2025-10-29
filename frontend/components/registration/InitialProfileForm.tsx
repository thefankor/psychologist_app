import {
	Pressable,
	Text,
	TextInput,
	View,
	ViewStyle,
	Image,
	Keyboard,
	TouchableWithoutFeedback,
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useState } from 'react';
import { styles } from './styles';
import { StatusBar } from 'expo-status-bar';
import { UI } from '@/types/ui';
import { Button, Select } from '../custom';
import { useRouter } from 'expo-router';

const labelStyle = {
	paddingTop: 0,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingRight: 12,
} as ViewStyle;

export enum Gender {
	NOT_CHOOSEN = 0,
	NOT_STATED = 1,
	MALE = 2,
	FEMALE = 3,
}

export interface InitState {
	name: string;
	gender: Gender;
	birthDate: string;
}

export const genderOptions = [
	{ label: Gender.NOT_STATED, value: 'Неважно' },
	{ label: Gender.MALE, value: 'Мужской' },
	{ label: Gender.FEMALE, value: 'Женский' },
];

const InitialProfileForm = () => {
	const router = useRouter();
	const [date, setDate] = useState(new Date());
	const [visible, setVisible] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [formState, setFormState] = useState<InitState>({
		name: '',
		gender: Gender.NOT_CHOOSEN,
		birthDate: 'Указать',
	});

	const calculateAge = (birthDate: Date) => {
		const now = new Date();
		let age = now.getFullYear() - birthDate.getFullYear();
		const m = now.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
		return age >= 0 ? age : 0;
	};

	const onConfirm = (params: { date?: Date }) => {
		setVisible(false);

		if (!params.date) return;

		const selectedDate = params.date;
		setDate(selectedDate);

		const age = calculateAge(selectedDate);

		setFormState((prev) => ({
			...prev,
			birthDate:
				typeof age === 'number' && age > 0 ? `${age} лет` : 'Указать',
		}));
	};

	const handleSelect = (genderValue: Gender) => {
		setFormState((prev) => ({
			...prev,
			gender: genderValue,
		}));
	};

	const handleNameChange = (text: string) => {
		setFormState((prev) => ({
			...prev,
			name: text,
		}));
	};

	const handleSubmit = () => {
		console.log('Form data:', formState);
	};

	const getDisplayAge = () => formState.birthDate;

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
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

				<View style={styles.container__header}>
					<Pressable
						style={styles.back__btn}
						onPress={() => router.push('/(auth)/AuthPage')}
					>
						<Image
							source={require('@/assets/images/back.png')}
							style={{ height: 24, width: 24 }}
						/>
					</Pressable>
					<Text style={styles.header__title}>Регистрация</Text>
				</View>

				<View style={styles.content}>
					<View style={styles.inputs__wrap}>
						<Text style={styles.container__title}>
							Расскажите о себе
						</Text>

						<View style={styles.input__wrap}>
							<TextInput
								style={[
									styles.input,
									isFocused && styles.active,
								]}
								value={formState.name}
								cursorColor={UI.colors.blue}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								placeholder={isFocused ? '' : 'Имя'}
								placeholderTextColor={UI.colors.mediumBlue}
								onChangeText={handleNameChange}
							/>
						</View>

						<Pressable
							style={[styles.input, labelStyle]}
							onPress={() => setVisible(true)}
						>
							<Text
								style={{
									fontFamily: 'Hezaedrus',
									fontSize: 16,
								}}
							>
								Ваш возраст
							</Text>
							<Text
								style={{
									fontFamily: 'Hezaedrus',
									fontSize: 16,
									color:
										formState.birthDate === 'Указать'
											? '#0114434D'
											: '#3565D9',
								}}
							>
								{getDisplayAge()}
							</Text>
						</Pressable>

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
							font='Hezaedrus'
						/>
					</View>

					<Button
						disabled={
							formState.name === '' ||
							formState.gender === Gender.NOT_CHOOSEN ||
							formState.birthDate === 'Указать'
						}
						text='Далее'
						onPress={handleSubmit}
						style={UI.styles.continueButton}
						textStyle={UI.styles.continueText}
						pressColor={UI.colors.pressableColor}
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default InitialProfileForm;
