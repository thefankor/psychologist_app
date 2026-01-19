import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StatusBar,
	SafeAreaView,
	ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { styles } from './styles';
import { getToken } from '@/helpers/helper';
import { Loading } from '../custom/ui/Loading';

export const SelectRole = () => {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<
		'psychologist' | 'client' | null
	>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		checkToken();
	}, []);

	const checkToken = async () => {
		try {
			setLoading(true);

			const token = await getToken();
			if (token) {
				router.replace('/profile');
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const saveRole = async (role: 'psychologist' | 'client') => {
		if (saving) return;

		setSaving(true);
		setSelectedRole(role);

		try {
			await SecureStore.setItemAsync('user_role', role);
			router.replace('/auth');
		} catch (err) {
			console.error('Ошибка сохранения роли:', err);
			setSelectedRole(null);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle='dark-content' backgroundColor='#FFFFFF' />

			<View style={styles.header}>
				<Text style={styles.headerTitle}>Выбор роли</Text>
			</View>

			<View style={styles.mainContent}>
				<Text style={styles.title}>Выберите роль</Text>

				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={[
							styles.roleButton,
							selectedRole === 'client' &&
								styles.roleButtonActive,
							saving && styles.disabled,
						]}
						onPress={() => saveRole('client')}
						disabled={saving}
						activeOpacity={0.85}
					>
						{saving && selectedRole === 'client' ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.buttonText}>Пользователь</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.roleButton,
							selectedRole === 'psychologist' &&
								styles.roleButtonActive,
							saving && styles.disabled,
						]}
						onPress={() => saveRole('psychologist')}
						disabled={saving}
						activeOpacity={0.85}
					>
						{saving && selectedRole === 'psychologist' ? (
							<ActivityIndicator color='#fff' />
						) : (
							<Text style={styles.buttonText}>Психолог</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
};
