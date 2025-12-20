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
		avatarUri: 'https://randomuser.me/api/portraits/women/46.jpg',
	},
	{
		id: 2,
		name: 'Елена Васильева',
		rating: 4.8,
		price: 4000,
		methods: 'КПТ, Психоанализ',
		sessionsCount: 3,
		experienceYears: 8,
		avatarUri: 'https://randomuser.me/api/portraits/women/68.jpg',
	},
	{
		id: 3,
		name: 'Арсен Маркарян',
		rating: 5,
		price: 4000,
		methods: 'Знает все',
		sessionsCount: 5,
		experienceYears: 100,
		avatarUri: require('@/assets/images/arsen.png'),
	},
];

export const Psychologists = () => {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={styles.titleWrapper}>
					<Text style={styles.title}>Онлайн</Text>
					<Text style={styles.title}>психотерапия</Text>
				</View>
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
