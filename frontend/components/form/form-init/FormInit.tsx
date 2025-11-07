import { Pressable, Text, TextInput, View, ViewStyle } from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useState } from 'react';
import { useKeyboard } from '@react-native-community/hooks';
import { styles } from './styles';
import { dataHandler } from '@/helpers/helper';
import { Select, Option } from '@/components/custom/ui/Select';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/custom/ui/Button';
import { UI } from '@/types/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormSteps } from '@/types/types';

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
	birthDate: Date | string;
}

export const genderOptions: Option[] = [
	{ label: Gender.NOT_STATED, value: 'Неважно' },
	{ label: Gender.MALE, value: 'Мужской' },
	{ label: Gender.FEMALE, value: 'Женский' },
];

interface Props {
	setStep: (step: FormSteps) => void;
}

export const FormInit = ({ setStep }: Props) => {
	const [date, setDate] = useState(new Date());
	const [visible, setVisible] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const [open, setOpen] = useState<boolean>(false);

	const [formState, setFormState] = useState<InitState>({
		name: '',
		gender: Gender.NOT_CHOOSEN,
		birthDate: 'Указать',
	});

	const calculateData = (birthDate: Date) => {
		const currentDate = new Date().getTime();
		const birthSeconds = birthDate.getTime();

		const age = Math.floor(
			(currentDate - birthSeconds) / (365 * 24 * 60 * 60 * 1000)
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

	const keyboard = useKeyboard();

	const sendData = async () => {
		try {
			await AsyncStorage.setItem(
				'initData',
				JSON.stringify({
					name: formState.name,
					age: formState.birthDate,
					gender: formState.gender,
				})
			);
			await AsyncStorage.setItem('init', 'true');
			setStep(FormSteps.STEP_ONE);
		} catch (err) {
			console.log('Error saving data:', err);
		}
	};

	return (
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
				<Text style={styles.container__title}>Расскажите о себе</Text>
				<View style={styles.input__wrap}>
					<TextInput
						autoFocus
						style={[styles.input, isFocused && styles.active]}
						value={formState.name}
						cursorColor={UI.colors.blue}
						onFocus={() => setIsFocused(true)}
						placeholder={isFocused ? '' : 'Имя'}
						placeholderTextColor={UI.colors.mediumBlue}
						onBlur={() => setIsFocused(false)}
						onChangeText={(text) =>
							dataHandler('name', text, setFormState)
						}
					/>
				</View>
				<Pressable
					style={[styles.input, labelStyle]}
					onPress={() => setVisible(true)}
				>
					<Text style={{ fontFamily: 'Hezaedrus' }}>Ваш возраст</Text>
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
									calculateData(formState.birthDate)
							  ).replaceAll('"', '')}
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
					maxHeight={160}
					setOpen={setOpen}
					selectStyle={styles.select__container}
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
				onPress={sendData}
				style={UI.styles.continueButton}
				textStyle={UI.styles.continueText}
				pressColor={UI.colors.pressableColor}
			/>
		</View>
	);
};
