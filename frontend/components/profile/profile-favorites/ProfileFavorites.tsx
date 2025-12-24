import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { styles } from './styles';
import Favorite from './favorite/Favorite';
import { getToken } from '@/helpers/helper';
import {
	getAllFavorites,
	deleteFavoritePsychologist,
} from '@/api/psychologists/psychologists';
import { Loading } from '@/components/custom/ui/Loading';

export type FavoriteTypes = {
	id: number;
	avatar: string | null;
	full_name: string;
	methods: string[];
};

const ProfileFavorites = () => {
	const [favorites, setFavorites] = useState<FavoriteTypes[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadFavorites();
	}, []);

	const loadFavorites = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			if (!token) {
				Alert.alert('Ошибка', 'Не удалось получить токен авторизации');
				return;
			}

			const data = await getAllFavorites(token);
			setFavorites(data || []);
		} catch (error) {
			console.log('Ошибка загрузки избранного:', error);
			Alert.alert('Ошибка', 'Не удалось загрузить список избранного');
		} finally {
			setLoading(false);
		}
	};

	const handleDeletePress = (id: number, fullName: string) => {
		Alert.alert(
			'Удалить из избранного',
			`Вы уверены, что хотите удалить ${fullName} из избранного?`,
			[
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: () => deleteFavorite(id),
				},
			]
		);
	};

	const deleteFavorite = async (id: number) => {
		try {
			const token = await getToken();
			if (!token) {
				Alert.alert('Ошибка', 'Не удалось получить токен');
				return;
			}

			await deleteFavoritePsychologist(token, id);

			setFavorites((prev) => prev.filter((item) => item.id !== id));
		} catch (error) {
			console.log('Ошибка удаления из избранного:', error);
			Alert.alert(
				'Ошибка',
				'Не удалось удалить специалиста из избранного'
			);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<View style={styles.container}>
			{favorites.length === 0 ? (
				<Text style={styles.container__title}>
					Вы пока не добавили в избранное специалистов
				</Text>
			) : (
				<ScrollView style={styles.conatiner__content}>
					{favorites.map((item) => (
						<Favorite
							key={item.id}
							id={item.id}
							avatar={item.avatar}
							full_name={item.full_name}
							methods={item.methods}
							onDelete={() =>
								handleDeletePress(item.id, item.full_name)
							}
						/>
					))}
				</ScrollView>
			)}
		</View>
	);
};

export default ProfileFavorites;
