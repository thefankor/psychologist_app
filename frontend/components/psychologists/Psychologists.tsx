import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { PsychologistCard } from './psychologist-card/PsychologistCard';
import { styles } from './styles';

const mockData = [
	{
		id: 1,
		name: 'Анастасия Степановна',
		rating: 4.9,
		price: 3500,
		methods: 'Гештальт терапия, Арт-терапия',
		sessionsCount: 4,
		experienceYears: 10,
		avatarUri: 'https://randomuser.me/api/portraits/women/44.jpg',
	},
	{
		id: 2,
		name: 'Елена Васильева',
		rating: 4.8,
		price: 4000,
		methods: 'КПТ, Психоанализ',
		sessionsCount: 3,
		experienceYears: 12,
		avatarUri: 'https://randomuser.me/api/portraits/women/68.jpg',
	},
];

export const Psychologists = () => {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Онлайн психотерапия</Text>
				<Pressable style={styles.menuButton}>
					<Image
						source={require('@/assets/images/menu-dots.png')}
						style={styles.menuIcon}
					/>
				</Pressable>
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				{mockData.map((item) => (
					<PsychologistCard
						key={item.id}
						{...item}
						onPress={() =>
							console.log('Открыть профиль', item.name)
						}
						onFavorite={() => console.log('В избранное')}
					/>
				))}
			</ScrollView>
		</View>
	);
};
