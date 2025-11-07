import { useEffect, useState } from 'react';
import {
	Pressable,
	View,
	Text,
	Image,
	ScrollView,
	Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import { FormInit } from './form-init/FormInit';
import { FormStep } from './form-step/FormStep';
import { FormDefault } from './form-default/FormDefault';
import { FormData, FormSteps } from '@/types/types';
import { StatusBar } from 'expo-status-bar';
import { useDispatch } from 'react-redux';
import { setPopupData } from '@/store/slices/popupSlice';
import * as NavigationBar from 'expo-navigation-bar';

const Form = () => {
	const dispatch = useDispatch();
	const [step, setStep] = useState<FormSteps>(FormSteps.INIT);
	const [isLoading, setIsLoading] = useState(true);
	const [formData, setFormData] = useState<FormData>({
		emotions: [],
		relations: [],
		work: [],
		life: [],
		personal: [],
		format: null,
		long: null,
		pricing: null,
		gender: null,
		time: null,
		method: null,
	});

	const fadeAnim = useState(new Animated.Value(1))[0];

	const animateStepChange = (callback: () => void) => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			callback();
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		});
	};

	const handleSetStep = (newStep: React.SetStateAction<FormSteps>) => {
		animateStepChange(() => {
			if (typeof newStep === 'function') {
				setStep(newStep);
			} else {
				setStep(newStep);
			}
		});
	};
	const handleBack = () => {
		animateStepChange(() => setStep((prev) => prev - 1));
	};

	const renderStep = () => {
		switch (step) {
			case FormSteps.INIT:
				return <FormInit setStep={handleSetStep} />;
			case FormSteps.STEP_ONE:
				return (
					<FormDefault
						setFormData={setFormData}
						formData={formData}
						setStep={handleSetStep}
					/>
				);
			case FormSteps.STEP_TWO:
			case FormSteps.STEP_THREE:
			case FormSteps.PRICING:
			case FormSteps.STEP_FOUR:
			case FormSteps.STEP_FIVE:
			case FormSteps.STEP_SIX:
				return (
					<FormStep
						step={step}
						setStep={handleSetStep}
						setFormData={setFormData}
						formData={formData}
					/>
				);
			default:
				return <FormInit setStep={handleSetStep} />;
		}
	};

	useEffect(() => {
		(async () => {
			const initCompleted = await AsyncStorage.getItem('init');
			if (initCompleted) {
				fadeAnim.setValue(0);
				setStep(FormSteps.STEP_ONE);
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}).start();
			}
			setIsLoading(false);
		})();
	}, []);

	const skipForm = () => {
		NavigationBar.setVisibilityAsync('hidden');
		dispatch(
			setPopupData({
				generalInfo: {
					isOpen: true,
					type: 'skip',
				},
			})
		);
	};

	return (
		<ScrollView style={styles.container}>
			<StatusBar style='dark' />
			<View style={styles.container__header}>
				{step === FormSteps.INIT ? (
					<></>
				) : (
					<Pressable style={styles.back__btn} onPress={handleBack}>
						<Image
							source={require('@/assets/images/back.png')}
							width={20}
							height={20}
							style={{ height: 24, width: 24 }}
						/>
					</Pressable>
				)}

				<Text style={styles.header__title}>
					{step === FormSteps.INIT ? 'Регистрация' : 'Анкета'}
				</Text>
			</View>
			<View style={styles.container__nav}>
				<View
					style={[
						styles.nav__wrap,
						step === FormSteps.INIT && {
							width: '100%',
						},
					]}
				>
					{step !== FormSteps.INIT &&
						new Array(7)
							.fill(null)
							.map((_, index) => (
								<View
									style={[
										styles.nav__item,
										step === index + 1 &&
											styles.nav__active,
									]}
									key={index}
								></View>
							))}
				</View>
				{step !== FormSteps.INIT && (
					<Pressable onPress={skipForm}>
						<Text style={styles.skip__text}>Пропустить</Text>
					</Pressable>
				)}
			</View>

			<Animated.View
				style={[styles.container__content, { opacity: fadeAnim }]}
			>
				{renderStep()}
			</Animated.View>
		</ScrollView>
	);
};
export default Form;
