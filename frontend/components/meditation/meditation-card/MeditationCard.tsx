import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './styles';

interface MeditationCardProps {
	title: string;
	emoji: any;
	color: string;
	duration: string;
	onPress: () => void;
}

export const MeditationCard = ({
	title,
	emoji,
	color,
	duration,
	onPress,
}: MeditationCardProps) => {
	return (
		<Pressable onPress={onPress} style={styles.cardPressable}>
			<View style={[styles.card, { borderLeftColor: color }]}>
				<View
					style={[styles.emojiContainer, { backgroundColor: color }]}
				>
					<Image
						source={emoji}
						style={styles.emoji}
						resizeMode='contain'
					/>
				</View>
				<View style={styles.info}>
					<Text style={styles.cardTitle}>{title}</Text>
					<Text style={styles.duration}>{duration}</Text>
				</View>
			</View>
		</Pressable>
	);
};
