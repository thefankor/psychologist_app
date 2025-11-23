import { View, Text } from 'react-native';
import { styles } from './styles';
import { Step, steps } from './steps';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FormData, FormSteps, MethodFormat } from '@/types/types';
import { FormBlock } from '../form-block/FormBlock';
import { Button } from '@/components/custom/ui/Button';
import { Select, Option } from '@/components/custom/ui/Select';
import { methods } from './methods';
import { UI } from '@/types/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendUserData } from '@/api/profile/profile';
import { getToken } from '@/helpers/helper';
import { useRouter } from 'expo-router';

interface Props {
	step: FormSteps;
	setFormData: Dispatch<SetStateAction<FormData>>;
	formData: FormData;
	setStep: Dispatch<SetStateAction<FormSteps>>;
}

interface QuestionWithLabel {
	text: string;
	label: any;
	label_description?: string;
	label_subtitle?: string;
}

const timeOptions: Option[] = [
	{ label: 0, value: 'До 12:00' },
	{ label: 1, value: 'С 12:00 до 18:00' },
	{ label: 2, value: 'После 18:00' },
	{ label: 3, value: 'До 12:00' },
	{ label: 4, value: 'С 12:00 до 18:00' },
	{ label: 5, value: 'После 18:00' },
];

export const FormStep = ({ step, setFormData, formData, setStep }: Props) => {
	const router = useRouter();
	const [stepState, setStepState] = useState<Step>({
		name: '',
		questions: [],
		label_description: [],
		label_subtitle: [],
		label: [],
		config: FormSteps.INIT,
	});
	const [buttonText, setButtonText] = useState<string>('Далее');
	const [selectedItems, setSelectedItems] = useState<any[]>([]);
	const [opened, setOpened] = useState<boolean>(false);

	useEffect(() => {
		const foundStep = steps.find((item) => item.config === step);
		if (foundStep) {
			setStepState(foundStep);

			if (foundStep.config === FormSteps.STEP_TWO) {
				setSelectedItems(formData.format || []);
			} else if (foundStep.config === FormSteps.STEP_THREE) {
				setSelectedItems(formData.long ? [formData.long] : []);
			} else if (foundStep.config === FormSteps.PRICING) {
				setSelectedItems(formData.pricing || []);
			} else if (foundStep.config === FormSteps.STEP_FOUR) {
				setSelectedItems(formData.gender ? [formData.gender] : []);
			} else if (foundStep.config === FormSteps.STEP_SIX) {
				setSelectedItems(formData.method || []);
			}
		}
		if (step === FormSteps.STEP_SIX) {
			setButtonText('Завершить');
		} else {
			setButtonText('Далее');
		}
	}, [step, formData]);

	const handleParameterToggle = (label: any) => {
		if (label === 'any' || label === 'closest') {
			setFormData((prev) => ({ ...prev, time: label }));
			setSelectedItems([label]);
			return;
		}

		if (label === 'exp') {
			setFormData((prev) => ({ ...prev, method: null }));
			setSelectedItems([]);
			return;
		}

		const newSelection = (() => {
			if (
				stepState.config === FormSteps.STEP_TWO ||
				stepState.config === FormSteps.PRICING ||
				stepState.config === FormSteps.STEP_SIX
			) {
				return selectedItems.includes(label)
					? selectedItems.filter((item) => item !== label)
					: [...selectedItems, label];
			} else {
				return [label];
			}
		})();

		setSelectedItems(newSelection);

		if (stepState.config === FormSteps.STEP_TWO) {
			setFormData((prev) => ({
				...prev,
				format: newSelection,
			}));
		} else if (stepState.config === FormSteps.STEP_THREE) {
			setFormData((prev) => ({
				...prev,
				long: newSelection[0],
			}));
		} else if (stepState.config === FormSteps.PRICING) {
			setFormData((prev) => ({
				...prev,
				pricing: newSelection,
			}));
		} else if (stepState.config === FormSteps.STEP_FOUR) {
			setFormData((prev) => ({
				...prev,
				gender: newSelection[0],
			}));
		} else if (stepState.config === FormSteps.STEP_SIX) {
			setFormData((prev) => ({
				...prev,
				method: newSelection as MethodFormat[],
			}));
		}
	};

	const handleTimeSelect = (value: any) => {
		setFormData((prev) => {
			const currentTime = Array.isArray(prev.time) ? prev.time : [];
			const newTime = currentTime.includes(value)
				? currentTime.filter((t) => t !== value)
				: [...currentTime, value];

			return { ...prev, time: newTime.length > 0 ? newTime : null };
		});
	};

	const handleMethodSelect = (value: MethodFormat) => {
		setFormData((prev) => {
			const currentMethods = Array.isArray(prev.method)
				? prev.method
				: [];
			const newMethods = currentMethods.includes(value)
				? currentMethods.filter((m) => m !== value)
				: [...currentMethods, value];

			return {
				...prev,
				method: newMethods.length > 0 ? newMethods : null,
			};
		});
	};

	const handleNext = async () => {
		setStep((prev) => {
			const nextStep = prev + 1;
			return nextStep <= FormSteps.STEP_SIX
				? nextStep
				: FormSteps.STEP_SIX;
		});

		if (step === FormSteps.STEP_SIX) {
			try {
				const initData = JSON.parse(
					(await AsyncStorage.getItem('initData'))!
				);
				const token = await getToken();
				const sendData = { ...initData, formData };

				if (token) {
					await sendUserData(token, sendData);
				}

				console.log(sendData);

				router.push('/(app)/profile/profile');
			} catch (err: any) {
				console.log(err.response.detail);
			}
		}
	};

	const questionsWithLabels: QuestionWithLabel[] = stepState.questions.map(
		(question, index) => ({
			text: question,
			label: stepState.label[index],
			label_description: stepState.label_description
				? stepState.label_description[index]
				: '',
			label_subtitle: stepState.label_subtitle
				? stepState.label_subtitle[index]
				: '',
		})
	);

	const formatTimeSelection = (selected: any[], options: Option[]) => {
		const weekdays = options.filter(
			(opt) =>
				!opt.label.includes('weekend') && selected.includes(opt.label)
		);
		const weekends = options.filter(
			(opt) =>
				opt.label.includes('weekend') && selected.includes(opt.label)
		);

		let result = [];
		if (weekdays.length > 0)
			result.push(`Будни: ${weekdays.map((w) => w.value).join(', ')}`);
		if (weekends.length > 0)
			result.push(`Выходные: ${weekends.map((w) => w.value).join(', ')}`);

		return result.join('; ');
	};

	const formatMethodSelection = (selected: MethodFormat[]) => {
		return selected
			.map((method) => {
				const found = methods.find((m) => m.value === method);
				return found ? found.label : method;
			})
			.join(', ');
	};

	return (
		<View style={styles.container}>
			<Text style={styles.container__title}>{stepState.name}</Text>
			{step === FormSteps.PRICING ? (
				<Text style={styles.container__description}>
					Обычно сессии проходят раз в неделю. Их количество зависит
					от вашего запроса и метода психотерапии
				</Text>
			) : null}

			<View style={styles.container__questions}>
				{questionsWithLabels.map((item, index) => {
					if (
						(step === FormSteps.STEP_FIVE && index === 2) ||
						(step === FormSteps.STEP_SIX && index === 1)
					) {
						return (
							<Select
								type={step === FormSteps.STEP_SIX}
								key={index}
								name={
									step === FormSteps.STEP_FIVE
										? 'Конкретное время'
										: 'Выбрать метод'
								}
								options={
									step === FormSteps.STEP_SIX
										? methods
										: timeOptions
								}
								value={
									step === FormSteps.STEP_SIX
										? Array.isArray(formData.method)
											? formData.method
											: []
										: Array.isArray(formData.time)
										? formData.time
										: []
								}
								onSelect={
									step === FormSteps.STEP_SIX
										? handleMethodSelect
										: handleTimeSelect
								}
								setOpen={setOpened}
								isActive={
									step === FormSteps.STEP_SIX
										? Array.isArray(formData.method) &&
										  formData.method.length > 0
										: Array.isArray(formData.time) &&
										  formData.time.length > 0
								}
								opened={opened}
								isCheckbox
								font='Hezaedrus500'
								hide
								displayFormatter={
									step === FormSteps.STEP_SIX
										? formatMethodSelection
										: formatTimeSelection
								}
								step={step}
							/>
						);
					}

					return (
						<FormBlock
							key={index}
							title={item.text}
							other={item.label_subtitle}
							description={item.label_description}
							checkbox={
								step === FormSteps.STEP_TWO ||
								step === FormSteps.PRICING ||
								step === FormSteps.STEP_SIX
							}
							radio={
								step === FormSteps.STEP_THREE ||
								step === FormSteps.STEP_FOUR ||
								step === FormSteps.STEP_FIVE ||
								step === FormSteps.STEP_SIX
							}
							isActive={
								!opened &&
								(selectedItems.includes(item.label) ||
									(step === FormSteps.STEP_FIVE &&
										((item.label === 'any' &&
											formData.time === 'any') ||
											(item.label === 'closest' &&
												formData.time ===
													'closest'))) ||
									(step === FormSteps.STEP_SIX &&
										item.label === 'exp' &&
										(!formData.method ||
											formData.method.length === 0)))
							}
							size={step === FormSteps.PRICING ? 20 : 14}
							onPress={() => {
								setOpened(false);
								handleParameterToggle(item.label);
							}}
						/>
					);
				})}
			</View>

			<Button
				text={buttonText}
				style={[
					UI.styles.continueButton,
					{ position: 'absolute', bottom: 170 },
				]}
				textStyle={UI.styles.continueText}
				pressColor={UI.colors.pressableColor}
				onPress={handleNext}
				disabled={
					selectedItems.length === 0 &&
					!(formData.time === 'any' || formData.time === 'closest') &&
					!(
						Array.isArray(formData.time) && formData.time.length > 0
					) &&
					!(
						Array.isArray(formData.method) &&
						formData.method.length > 0
					)
				}
			/>
		</View>
	);
};
