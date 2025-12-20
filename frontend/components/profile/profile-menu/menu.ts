import { ImageProps, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { deleteToken, getToken } from '@/helpers/helper';
import { deleteUser } from '@/api/profile/profile';

export interface Menu {
	image: ImageProps;
	name: string;
	type: 'logout' | 'redirect' | 'switch';
	action: () => void;
}

export const useMenu = (): Menu[] => {
	const router = useRouter();

	const logout = async () => {
		await deleteToken();
		router.push('/auth');
	};

	const deleteProfile = async () => {
		Alert.alert(
			'Удаление аккаунта',
			'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.',
			[
				{
					text: 'Отмена',
					style: 'cancel',
				},
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: async () => {
						try {
							const token = await getToken();
							console.log('menu', token);
							if (token) {
								await deleteUser(token);
								await deleteToken();

								router.push('/auth');
							}
						} catch (error) {
							console.log('Ошибка при удаления профиля:', error);
							Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
						}
					},
				},
			]
		);
	};

	return [
		{
			name: 'Мои данные',
			type: 'redirect',
			image: require('@/assets/images/user.png'),
			action: () => router.push('/profile/edit'),
		},
		{
			name: 'Мои сессии',
			type: 'redirect',
			image: require('@/assets/images/sessions.png'),
			action: () => router.push('/profile/sessions'),
		},
		{
			name: 'Избранное',
			type: 'redirect',
			image: require('@/assets/images/favorite.png'),
			action: () => router.push('/profile/favorites'),
		},
		{
			name: 'Способы оплаты',
			type: 'redirect',
			image: require('@/assets/images/payments.png'),
			action: () => router.push('/profile/methods'),
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
