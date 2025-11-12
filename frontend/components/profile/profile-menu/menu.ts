import { ImageProps } from 'react-native';
import { useRouter } from 'expo-router';
import { deleteToken, getToken } from '@/helpers/helper';
import { deleteUser } from '@/api/profile/profile';
import { Alert } from 'react-native';

export interface Menu {
	image: ImageProps;
	name: string;
	type: 'logout' | 'redirect' | 'switch';
	action: () => void;
}

export const useMenu = (): Menu[] => {
	const router = useRouter();

	const logout = () => {
		router.push('/(auth)/AuthPage');
	};

	// const deleteProfile = async () => {
	// 	Alert.alert(
	// 		'Удаление аккаунта',
	// 		'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.',
	// 		[
	// 			{
	// 				text: 'Отмена',
	// 				style: 'cancel',
	// 			},
	// 			{
	// 				text: 'Удалить',
	// 				style: 'destructive',
	// 				onPress: async () => {
	// 					try {
	// 						const token = await getToken();
	// 						console.log('menu', token);
	// 						if (token) {
	// 							await deleteUser(token);
	// 							await deleteToken();

	// 							router.push('/(auth)/AuthPage');
	// 						}
	// 					} catch (error) {
	// 						console.log('Ошибка при удаления профиля:', error);
	// 						Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
	// 					}
	// 				},
	// 			},
	// 		]
	// 	);
	// };

	const deleteProfile = () => {
		console.log('Пользователь удален');
	};
	return [
		{
			name: 'Мои данные',
			type: 'redirect',
			image: require('@/assets/images/user.png'),
			action: () => router.push('/(auth)/ProfileEditPage'),
		},
		{
			name: 'Избранное',
			type: 'redirect',
			image: require('@/assets/images/favorite.png'),
			action: () => router.push('/(auth)/ProfileFavoritesPage'),
		},
		{
			name: 'Способы оплаты',
			type: 'redirect',
			image: require('@/assets/images/payments.png'),
			action: () => router.push('/(auth)/ProfileMethodsPage'),
		},
		{
			name: 'Удалить аккаунт',
			type: 'redirect',
			image: require('@/assets/images/delete.png'),
			action: () => deleteProfile(),
		},
		{
			name: 'Выйти',
			type: 'logout',
			image: require('@/assets/images/exit.png'),
			action: () => logout(),
		},
	];
};
