import React, { useState, useEffect } from 'react';
import {
	ScrollView,
	View,
	Text,
	ImageBackground,
	Pressable,
	Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './styles';
import { MeditationCard } from './meditation-card/MeditationCard';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	FadeInDown,
} from 'react-native-reanimated';
import { meditationItems } from './meditationItems';

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.75;

export default function Meditation() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	const translateY = useSharedValue(SHEET_HEIGHT);

	useEffect(() => {
		translateY.value = withTiming(isOpen ? 0 : SHEET_HEIGHT, {
			duration: 300,
		});
	}, [isOpen]);

	const sheetStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<View style={styles.container}>
			<ImageBackground
				source={require('@/assets/images/clouds.jpg')}
				style={styles.background}
				resizeMode='cover'
			>
				<View style={styles.header}>
					<Text style={styles.title}>
						Давайте помедитируем вместе
					</Text>
					<Text style={styles.subtitle}>
						Не обязательно доставать коврик, поджигать благовония и
						надевать спортивный костюм — только если очень хочется
					</Text>

					<Pressable
						style={styles.forwardButton}
						onPress={() => setIsOpen(true)}
					>
						<Text style={styles.forwardText}>Вперёд</Text>
					</Pressable>
				</View>
			</ImageBackground>

			{isOpen && (
				<Pressable
					style={styles.backdrop}
					onPress={() => setIsOpen(false)}
				/>
			)}

			<Animated.View
				style={[styles.dropdown, { height: SHEET_HEIGHT }, sheetStyle]}
			>
				<View style={styles.handle} />

				<Text style={styles.dropdownTitle}>
					Выберите тему для медитации
				</Text>

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 60 }}
				>
					{meditationItems.map((item, index) => (
						<Animated.View
							key={item.id}
							entering={FadeInDown.delay(index * 60)}
						>
							<MeditationCard
								{...item}
								onPress={() => {
									setIsOpen(false);
									router.push({
										pathname: '/meditation/player',
										params: { id: item.id.toString() },
									});
								}}
							/>
						</Animated.View>
					))}
				</ScrollView>
			</Animated.View>
		</View>
	);
}
