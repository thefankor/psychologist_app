import React, { useEffect, useState } from 'react';
import {
	Text,
	TextInput,
	View,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { styles } from './styles';
import { UI } from '@/types/ui';
import { useRouter } from 'expo-router';
import { Button } from '../custom';
import { getVerifyCode } from '@/api/auth/auth';
import { getToken } from '@/helpers/helper';

const Auth = () => {
	const [email, setEmail] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		checkToken();
	}, []);

	const checkToken = async () => {
		const token = await getToken();
		if (token) {
			router.replace('/(app)/profile/profile');
		}
	};

	const validateEmail = (email: string): string | null => {
		if (email.length === 0) return 'Поле не должно быть пустым';
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return 'Введите корректный email адрес';
		return null;
	};

	const sendEmail = async (email: string) => {
		setIsLoading(true);
		setError(null);
		const validationError = validateEmail(email);
		if (validationError) {
			setError(validationError);
			return;
		}

		await getVerifyCode(email);
		router.push({
			pathname: '/(app)/auth/verify',
			params: { email },
		});

		setIsLoading(false);
	};

	const handleEmailChange = (text: string) => {
		setEmail(text);
		if (error) setError(null);
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
			style={styles.keyboardAvoidingView}
		>
			<View style={styles.container}>
				<View style={styles.content}>
					<Text style={styles.input__title}>
						Ваша электронная почта
					</Text>

					<View style={styles.input__wrap}>
						<TextInput
							autoFocus
							placeholder={
								email.length === 0 ? 'Введите почту' : undefined
							}
							autoCorrect={false}
							autoComplete='off'
							cursorColor={UI.colors.blue}
							placeholderTextColor={UI.colors.descriptionGray}
							selectionColor={UI.colors.blue}
							style={[
								styles.email__input,
								error && UI.styles.error__input,
							]}
							textContentType='emailAddress'
							keyboardType='email-address'
							autoCapitalize='none'
							value={email}
							onChangeText={handleEmailChange}
							returnKeyType='send'
							editable={!isLoading}
							onSubmitEditing={() => sendEmail(email)}
						/>
					</View>

					{error && <Text style={styles.error__text}>{error}</Text>}

					<Button
						text={
							isLoading ? 'Отправка...' : 'Получить код из письма'
						}
						pressColor='#0043E9'
						style={[UI.styles.continueButton]}
						textStyle={styles.button__text}
						disabled={isLoading}
						onPress={() => sendEmail(email)}
					/>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

export default Auth;
