import { View, Text, Image, Pressable } from 'react-native';
import { styles } from './styles';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PsychologistCardProps {
	name: string;
	rating: number;
	price: number;
	methods: string;
	sessionsCount?: number;
	experienceYears?: number;
	avatarUri: string;
	onPress: () => void;
	onFavorite: () => void;
}

export const PsychologistCard = ({
	name,
	rating,
	price,
	methods,
	sessionsCount = 4,
	experienceYears = 10,
	avatarUri,
	onPress,
	onFavorite,
}: PsychologistCardProps) => {
	return (
		<Animated.View
			entering={FadeInDown.duration(600)}
			style={styles.container}
		>
			<Pressable onPress={onPress} style={styles.pressable}>
				<View style={styles.card}>
					<View style={styles.bgCircle} />

					<View style={styles.avatarContainer}>
						<Image
							source={{ uri: avatarUri }}
							style={styles.avatar}
						/>

						<View style={styles.ratingBadge}>
							<Image
								source={require('@/assets/images/star-filled.png')}
								style={styles.starIcon}
							/>
							<Text style={styles.ratingText}>
								{rating.toFixed(1)}
							</Text>
						</View>

						<Pressable
							style={styles.favoriteButton}
							onPress={onFavorite}
						>
							<Image
								source={require('@/assets/images/heart-outline.png')}
								style={styles.heartIcon}
							/>
						</Pressable>
					</View>

					<View style={styles.info}>
						<Text style={styles.name}>{name}</Text>
						<Text style={styles.methods}>{methods}</Text>

						<View style={styles.priceRow}>
							<Text style={styles.priceLabel}>от </Text>
							<Text style={styles.price}>
								{price.toLocaleString('ru')}
							</Text>
							<Text style={styles.currency}> ₽</Text>
							<View style={styles.infoBadge}>
								<Text style={styles.infoText}>i</Text>
							</View>
						</View>

						<View style={styles.stats}>
							<View style={styles.statItem}>
								<Image
									source={require('@/assets/images/flag.png')}
									style={styles.statIcon}
								/>
								<Text style={styles.statText}>
									{sessionsCount} из 5 тем
								</Text>
							</View>

							<View style={styles.statItem}>
								<Image
									source={require('@/assets/images/briefcase.png')}
									style={styles.statIcon}
								/>
								<Text style={styles.statText}>
									{experienceYears} лет опыта
								</Text>
							</View>
						</View>

						<Pressable style={styles.bookButton}>
							<Text style={styles.bookButtonText}>
								Записаться
							</Text>
						</Pressable>
					</View>
				</View>
			</Pressable>
		</Animated.View>
	);
};
