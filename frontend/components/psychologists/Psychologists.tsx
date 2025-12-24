import { ScrollView, View, Text } from 'react-native';
import { PsychologistCard } from './psychologist-card/PsychologistCard';
import { styles } from './styles';
import { getToken } from '@/helpers/helper';
import { useEffect, useState } from 'react';
import {
	getAllPsyshologists,
	getAllFavorites,
} from '@/api/psychologists/psychologists';
import { Loading } from '../custom/ui/Loading';
import { Psychologist } from '@/types/types';

export const Psychologists = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
	const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			if (!token) return;

			const [psychologistsRes, favoritesRes] = await Promise.all([
				getAllPsyshologists(token),
				getAllFavorites(token),
			]);

			setPsychologists(psychologistsRes || []);

			const favIds = new Set<number>(
				(favoritesRes || []).map((fav: any) => fav.id)
			);
			setFavoriteIds(favIds);
		} catch (error) {
			console.log('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	};

	const toggleFavorite = (id: number) => {
		setFavoriteIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.titleWrapper}>
					<Text style={styles.title}>Онлайн</Text>
					<Text style={styles.title}>психотерапия</Text>
				</View>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{psychologists.map((item) => (
					<PsychologistCard
						key={item.id}
						psychologist={item}
						isFavorite={favoriteIds.has(item.id)}
						onFavoriteToggle={() => toggleFavorite(item.id)}
					/>
				))}
			</ScrollView>
		</View>
	);
};
