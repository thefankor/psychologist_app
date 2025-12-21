import { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { styles } from './styles';
import { FavoriteTypes } from '@/types/types';
import Favorite from './favorite/Favorite';

const ProfileFavorites = () => {
	const [favorites, setFavorites] = useState<FavoriteTypes[]>([
		{
			id: 1,
			avatar: '',
			full_name: 'Имя Фамилия',
			methods: ['GESTALT'],
		},
		{
			id: 2,
			avatar: '',
			full_name: 'Фамилия Имя',
			methods: ['PSYHODRAM', 'GESTALT'],
		},
	]);

	const handleDelete = (id: number) => {
		setFavorites((prev) => prev.filter((item) => item.id !== id));
	};

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
							{...item}
							onDelete={() => handleDelete(item.id)}
						/>
					))}
				</ScrollView>
			)}
		</View>
	);
};
export default ProfileFavorites;
