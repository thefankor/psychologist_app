import React, { useEffect, useRef, useState } from 'react';
import {
	Image,
	Keyboard,
	Pressable,
	Text,
	TextInput,
	View,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
} from 'react-native';

import { styles } from './styles';
import { UI } from '@/types/ui';
import { StatusBar } from 'expo-status-bar';
import { formatTime, saveToken } from '@/helpers/helper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../custom';
import { checkVerifyCode, getVerifyCode } from '@/api/auth/auth';

const AuthCode = () => {
	const router = useRouter();
	const [codes, setCodes] = useState<string[]>(['', '', '', '', '']);
	const inputRefs = useRef<(TextInput | null)[]>([]);
	const [status, setStatus] = useState<'default' | 'error' | 'success'>(
		'default'
	);
	const [timer, setTimer] = useState(60);
	const { email } = useLocalSearchParams<{ email: string }>();

	useEffect(() => {
		if (timer <= 0) return;
		const interval = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [timer]);

	const verifyCode = async (codesArray: string[]) => {
		const code = codesArray.join('');

		if (code.length < 5) return;

		try {
			const res = await checkVerifyCode(email, code);

			setStatus('success');
			Keyboard.dismiss();
			if (res) {
				await saveToken(res.token);
			}
			router.push('/(auth)/FormPage');
		} catch (err) {
			setStatus('error');
			console.log(err);
		}
	};

	const handleChange = (text: string, index: number) => {
		const cleanedText = text.replace(/[^0-9]/g, '');
		const newCodes = [...codes];
		newCodes[index] = cleanedText;
		setCodes(newCodes);

		if (index < 4 && cleanedText) inputRefs.current[index + 1]?.focus();

		if (newCodes.every((c) => c !== '')) {
			verifyCode(newCodes);
		} else {
			setStatus('default');
		}
	};

	const handleSendAgain = async () => {
		setTimer(60);
		await getVerifyCode(email);
	};

	const handleKeyPress = ({ nativeEvent }: any, index: number) => {
		if (nativeEvent.key === 'Backspace') {
			if (codes[index] === '' && index > 0)
				inputRefs.current[index - 1]?.focus();
			setCodes((prev) => {
				const newCodes = [...prev];
				newCodes[index] = '';
				return newCodes;
			});
			setStatus('default');
		}
	};

	const getInputStyle = (index: number) => {
		switch (status) {
			case 'error':
				return { borderColor: 'red', color: 'red' };
			case 'success':
				return { borderColor: 'green', color: 'green' };
			default:
				return {};
		}
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
				style={{ flex: 1 }}
			>
				<StatusBar style='dark' />
				<View style={[styles.container, { justifyContent: 'center' }]}>
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
						<Text style={styles.header__title}>Код из почты</Text>
					</View>

					<View style={styles.code__container}>
						<Text style={styles.code__title}>
							Введите 5-значный код
						</Text>
						<Text style={styles.code__description}>
							Письмо с кодом было отправлено на почту {email}
						</Text>

						<View style={styles.input__wrap}>
							{codes.map((code, index) => (
								<TextInput
									key={index}
									ref={(ref) => {
										inputRefs.current[index] = ref;
									}}
									value={code}
									onChangeText={(text) =>
										handleChange(text, index)
									}
									onKeyPress={(e) => handleKeyPress(e, index)}
									keyboardType='number-pad'
									cursorColor={UI.colors.blue}
									selectionColor={UI.colors.blue}
									maxLength={1}
									style={[
										styles.input,
										code !== '' && styles.input__active,
										getInputStyle(index),
									]}
									autoFocus={index === 0}
									autoCorrect={false}
									autoComplete='off'
								/>
							))}
						</View>

						{status === 'error' && (
							<Text style={styles.container__error}>
								Неверный код. Повторите попытку
							</Text>
						)}

						{timer === 0 ? (
							<Button
								text='Отправить ещё раз'
								pressColor={UI.colors.pressableColor}
								style={UI.styles.continueButton}
								textStyle={UI.styles.continueText}
								onPress={handleSendAgain}
							/>
						) : (
							<Text style={styles.repeat__text}>
								Отправить запрос повторно{' '}
								<Text style={styles.code__timer}>
									{formatTime(timer)}
								</Text>
							</Text>
						)}
					</View>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default AuthCode;
