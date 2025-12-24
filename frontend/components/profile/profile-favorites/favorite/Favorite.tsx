import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { formatMethods } from '@/helpers/helper';

interface FavoriteProps {
	id: number;
	avatar: string | null;
	full_name: string;
	methods: string[];
	onDelete: () => void;
}

const Favorite = ({ full_name, avatar, methods, onDelete }: FavoriteProps) => {
	const isArsen = full_name === 'Арсен Маркарян';

	const avatarSource = isArsen
		? require('@/assets/images/arsen.png')
		: avatar && avatar.trim() !== ''
		? { uri: avatar }
		: require('@/assets/images/ad.png');

	return (
		<View style={styles.wrapper}>
			<View style={styles.container}>
				<View style={styles.container__content}>
					<Image
						source={avatarSource}
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
