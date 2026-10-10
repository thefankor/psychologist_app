import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import { Button } from '@/components/custom';
import { Session } from '@/types/types';

interface SessionCardProps {
	session: Session;
	onJoin?: () => void;
	role: string;
}

export const ProfileSessionCard = ({
	session,
	onJoin,
	role,
}: SessionCardProps) => {
	const { start_at, is_group, attendees } = session;

	const psychologist = attendees.find((a) => a.role === role);
	const psychologistName = psychologist?.name ?? 'Психолог';
	const avatarSource = psychologist?.avatar
		? { uri: psychologist.avatar }
		: require('@/assets/images/ad.png');

	const sessionDate = new Date(start_at);
	const now = new Date();

	const date = sessionDate.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
	const time = sessionDate.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const type = is_group ? 'Групповая сессия' : 'Индивидуальная сессия';

	const timeDiffMs = sessionDate.getTime() - now.getTime();
	const minutesDiff = timeDiffMs / 1000 / 60;
	const canJoin = minutesDiff >= -15 && minutesDiff <= 15;
	const isFullyPast = minutesDiff < -15;

	let buttonText = 'Подключиться к занятию';
	let disabled = true;

	if (isFullyPast) {
		buttonText = 'Занятие прошло';
	} else if (canJoin) {
		buttonText = 'Подключиться к занятию';
		disabled = false;
	} else {
		buttonText = 'Занятие скоро начнётся';
	}

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Image source={avatarSource} style={styles.avatar} />

				<View style={styles.info}>
					<Text style={styles.name}>{psychologistName}</Text>
					<Text style={styles.dateTime}>
						{date}, {time}
					</Text>
					<Text style={styles.type}>{type}</Text>
				</View>
			</View>

			<Button
				text={buttonText}
				pressColor='#3a6bf5'
				style={styles.activeButton}
				textStyle={styles.activeButtonText}
				onPress={onJoin}
				disabled={disabled}
			/>
		</View>
	);
};
