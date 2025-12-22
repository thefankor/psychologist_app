import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	Pressable,
	Image,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './styles';
import { methods } from '../methodItems';
import {
	getPaymentMethods,
	addPaymentMethod,
	verifyPaymentMethod,
} from '@/api/payment/payment';
import { getUser } from '@/api/profile/profile';
import { getToken } from '@/helpers/helper';
import { Loading } from '@/components/custom/ui/Loading';

interface SbpMethod {
	id: number;
	phone: string;
	bank: string;
}

interface PaymentMethodsResponse {
	sbp: SbpMethod[];
}

const AddProfileMethod = () => {
	const router = useRouter();

	const [phone, setPhone] = useState('');
	const [code, setCode] = useState('');

	const [phoneError, setPhoneError] = useState<string | null>(null);
	const [bankError, setBankError] = useState<string | null>(null);
	const [codeError, setCodeError] = useState<string | null>(null);

	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'form' | 'code'>('form');

	const [selectedBank, setSelectedBank] = useState<string | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [existingBanks, setExistingBanks] = useState<string[]>([]);

	useEffect(() => {
		init();
	}, []);

	const init = async () => {
		await Promise.all([fetchExistingBanks(), fetchUserPhone()]);
	};

	const fetchExistingBanks = async () => {
		try {
			const token = await getToken();
			if (!token) return;

			const res: PaymentMethodsResponse = await getPaymentMethods(token);
			if (res?.sbp) {
				setExistingBanks(res.sbp.map((m) => m.bank.toLowerCase()));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const fetchUserPhone = async () => {
		try {
			const token = await getToken();
			if (!token) return;

			const user = await getUser(token);
			if (user?.phone) {
				setPhone(user.phone);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handlePhoneChange = (text: string) => {
		let value = text.replace(/[^\d+]/g, '');

		if (!value.startsWith('+')) {
			value = '+' + value.replace(/\D/g, '');
		}

		if (!value.startsWith('+7')) {
			setPhone(value);
			setPhoneError(null);
			return;
		}

		if (value.length > 12) return;

		setPhone(value);
		setPhoneError(null);
	};

	const validatePhone = (): boolean => {
		if (!phone) {
			setPhoneError('Введите номер телефона');
			return false;
		}

		if (!phone.startsWith('+7') || phone.length !== 12) {
			setPhoneError('Номер должен быть в формате +7XXXXXXXXXX');
			return false;
		}

		return true;
	};

	const handleAdd = async () => {
		setPhoneError(null);
		setBankError(null);

		if (!validatePhone()) return;

		if (!selectedBank) {
			setBankError('Выберите банк');
			return;
		}

		try {
			setLoading(true);
			const token = await getToken();
			if (!token) throw new Error();

			await addPaymentMethod(token, phone, selectedBank);
			setStep('code');
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
		}
	};

	const handleVerify = async () => {
		if (code.length !== 5) {
			setCodeError('Введите 5-значный код');
			return;
		}

		try {
			setLoading(true);
			const token = await getToken();
			if (!token) throw new Error();

			await verifyPaymentMethod(token, phone, code);
			router.back();
		} catch (e) {
			console.log(e);
			setCodeError('Неверный код');
		} finally {
			setLoading(false);
		}
	};

	const availableBanks = methods.filter(
		(m) => !existingBanks.includes(m.bank.toLowerCase())
	);

	const handleOutsidePress = () => {
		Keyboard.dismiss();
		setShowDropdown(false);
	};

	if (loading) return <Loading />;

	return (
		<Pressable style={{ flex: 1 }} onPress={handleOutsidePress}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoidingView}
			>
				<View style={styles.container}>
					{step === 'form' && (
						<>
							<Text style={styles.label}>Номер телефона</Text>
							<TextInput
								style={[
									styles.input,
									phoneError && styles.inputError,
								]}
								value={phone}
								onChangeText={handlePhoneChange}
								placeholder='+7XXXXXXXXXX'
								keyboardType='phone-pad'
							/>
							{phoneError && (
								<Text style={styles.errorText}>
									{phoneError}
								</Text>
							)}

							<Text style={styles.label}>Банк</Text>
							<View style={styles.selectWrapper}>
								<Pressable
									style={[
										styles.dropdown,
										bankError && styles.inputError,
									]}
									onPress={() => setShowDropdown((v) => !v)}
								>
									<Text style={styles.dropdownText}>
										{selectedBank || 'Выберите банк'}
									</Text>
								</Pressable>

								{bankError && (
									<Text style={styles.bankErrorText}>
										{bankError}
									</Text>
								)}

								{showDropdown && (
									<View style={styles.dropdownOverlay}>
										<ScrollView
											style={styles.dropdownList}
											keyboardShouldPersistTaps='handled'
										>
											{availableBanks.map((bank) => (
												<Pressable
													key={bank.bank}
													style={styles.dropdownItem}
													onPress={() => {
														setSelectedBank(
															bank.bank
														);
														setShowDropdown(false);
													}}
												>
													<Image
														source={bank.image}
														style={styles.bankIcon}
													/>
													<Text
														style={styles.bankText}
													>
														{bank.bank}
													</Text>
												</Pressable>
											))}
										</ScrollView>
									</View>
								)}
							</View>

							<Pressable
								style={styles.addButton}
								onPress={handleAdd}
							>
								<Text style={styles.addButtonText}>
									Добавить
								</Text>
							</Pressable>
						</>
					)}

					{step === 'code' && (
						<>
							<Text style={styles.label}>
								Введите код подтверждения
							</Text>
							<TextInput
								style={[
									styles.input,
									codeError && styles.inputError,
								]}
								value={code}
								onChangeText={(v) =>
									setCode(v.replace(/\D/g, ''))
								}
								maxLength={5}
								keyboardType='number-pad'
							/>
							{codeError && (
								<Text style={styles.errorText}>
									{codeError}
								</Text>
							)}

							<Pressable
								style={styles.addButton}
								onPress={handleVerify}
							>
								<Text style={styles.addButtonText}>
									Подтвердить
								</Text>
							</Pressable>
						</>
					)}
				</View>
			</KeyboardAvoidingView>
		</Pressable>
	);
};

export default AddProfileMethod;
