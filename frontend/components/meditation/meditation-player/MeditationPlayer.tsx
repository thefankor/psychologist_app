import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ImageBackground, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { meditationItems } from '../meditationItems';
import { Loading } from '@/components/custom/ui/Loading';

export default function MeditationPlayer() {
	const { id } = useLocalSearchParams();
	const router = useRouter();

	const item = meditationItems.find((i) => i.id === Number(id));

	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [position, setPosition] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		let currentSound: Audio.Sound | null = null;

		const loadAudio = async () => {
			try {
				const { sound: newSound } = await Audio.Sound.createAsync(
					item?.audio || require('@/assets/audio/default.mp3'),
					{ shouldPlay: false }
				);

				if (!isMounted) {
					await newSound.unloadAsync();
					return;
				}

				currentSound = newSound;

				newSound.setOnPlaybackStatusUpdate((status) => {
					if (!status.isLoaded) return;

					setPosition(status.positionMillis ?? 0);

					if (status.didJustFinish) {
						setIsPlaying(false);
						newSound.setPositionAsync(0);
					}
				});

				const status = await newSound.getStatusAsync();
				if (status.isLoaded && status.durationMillis) {
					setDuration(status.durationMillis);
				}

				setSound(newSound);
			} catch (e) {
				console.error('Ошибка загрузки аудио:', e);
			} finally {
				setIsLoading(false);
			}
		};

		loadAudio();

		return () => {
			isMounted = false;
			if (currentSound) {
				currentSound.unloadAsync().catch(() => {});
			}
		};
	}, [id]);

	useFocusEffect(
		useCallback(() => {
			return () => {
				if (sound) {
					sound.pauseAsync().catch(() => {});
					setIsPlaying(false);
				}
			};
		}, [sound])
	);

	const playPause = async () => {
		if (!sound) return;

		const status = await sound.getStatusAsync();
		if (!status.isLoaded) return;

		if (status.isPlaying) {
			await sound.pauseAsync();
			setIsPlaying(false);
		} else {
			await sound.playAsync();
			setIsPlaying(true);
		}
	};

	const restart = async () => {
		if (!sound) return;

		await sound.setPositionAsync(0);
		await sound.playAsync();

		setPosition(0);
		setIsPlaying(true);
	};

	const seekBy = async (delta: number) => {
		if (!sound) return;

		const status = await sound.getStatusAsync();
		if (!status.isLoaded) return;

		let newPos = status.positionMillis + delta;
		newPos = Math.max(0, Math.min(newPos, duration));

		await sound.setPositionAsync(newPos);
		setPosition(newPos);
	};

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;

		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	};

	if (!item) {
		return (
			<View style={styles.container}>
				<Text>Тема не найдена</Text>
			</View>
		);
	}

	return (
		<ImageBackground
			source={item.bgImage}
			style={styles.container}
			resizeMode='cover'
		>
			<Pressable style={styles.backButton} onPress={() => router.back()}>
				<Image
					source={require('@/assets/images/back.png')}
					style={styles.backImage}
				/>
			</Pressable>

			{isLoading ? (
				<Loading />
			) : (
				<View style={styles.content}>
					<Text style={styles.title}>{item.title}</Text>

					<Text style={styles.time}>
						{formatTime(position)} / {formatTime(duration)}
					</Text>

					<View style={styles.controls}>
						<Pressable
							style={styles.controlButton}
							onPress={restart}
						>
							<Ionicons
								name='refresh'
								size={34}
								color='#3E75FF'
							/>
						</Pressable>

						<Pressable
							style={styles.controlButton}
							onPress={() => seekBy(-10000)}
						>
							<Ionicons
								name='play-back'
								size={34}
								color='#3E75FF'
							/>
						</Pressable>

						<Pressable
							style={styles.playButton}
							onPress={playPause}
						>
							<Ionicons
								name={isPlaying ? 'pause' : 'play'}
								size={44}
								color='#3E75FF'
							/>
						</Pressable>

						<Pressable
							style={styles.controlButton}
							onPress={() => seekBy(10000)}
						>
							<Ionicons
								name='play-forward'
								size={34}
								color='#3E75FF'
							/>
						</Pressable>
					</View>
				</View>
			)}
		</ImageBackground>
	);
}
