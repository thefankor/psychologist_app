import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { FavoriteTypes } from '@/types/types';

interface FavoriteProps extends FavoriteTypes {
	onDelete: () => void;
}

const Favorite = ({ avatar, full_name, methods, onDelete }: FavoriteProps) => {
	const formatMethods = (methods: string[]) => {
		const methodLabels: Record<string, string> = {
			GESTALT: 'Гештальт-терапия',
			PSYHODRAM: 'Психодрама',
			PSYHOANALIZE: 'Психоаналитические направления',
			EXISTENTIAL: 'Экзистенциальная психотерапия',
			SYSTEM: 'Системная семейная психотерапия',
		};

		return methods
			.map((method) => methodLabels[method] || method)
			.join(', ');
	};

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<View style={styles.container__content}>
					<Image
						source={require('@/assets/images/avatar.png')}
						style={styles.container__avatar}
					/>
					<View style={styles.container__info}>
						<Text style={styles.container__title}>{full_name}</Text>
						<Text style={styles.container__description}>
							{formatMethods(methods)}
						</Text>
					</View>
					<Pressable style={styles.deleteButton} onPress={onDelete}>
						<Image
							source={require('@/assets/images/delete.png')}
							style={styles.delete__image}
						/>
					</Pressable>
				</View>
			</View>
		</View>
	);
};

export default Favorite;
