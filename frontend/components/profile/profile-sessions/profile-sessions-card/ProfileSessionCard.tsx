import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import { Button } from '@/components/custom';
import { Session } from '@/types/types';

interface SessionCardProps {
	session: Session;
	onJoin?: () => void;
}

export const ProfileSessionCard = ({ session, onJoin }: SessionCardProps) => {
	const { start_at, is_group, attendees } = session;

	const psychologist = attendees.find((a) => a.role === 'PSYCHOLOGIST');

	const psychologistName = psychologist?.name ?? 'Психолог';
	const avatarUri = psychologist?.avatar;

	const dateObj = new Date(start_at);

	const date = dateObj.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});

	const time = dateObj.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const type = is_group ? 'Групповая сессия' : 'Индивидуальная сессия';

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Image
					source={require('@/assets/images/ad.png')}
					style={styles.avatar}
				/>

				<View style={styles.info}>
					<Text style={styles.name}>{psychologistName}</Text>
					<Text style={styles.dateTime}>
						{date}, {time}
					</Text>
					<Text style={styles.type}>{type}</Text>
				</View>
			</View>

			<Button
				text='Подключиться к занятию'
				pressColor='#3a6bf5'
				style={styles.activeButton}
				textStyle={styles.activeButtonText}
				onPress={onJoin}
			/>
		</View>
	);
};
