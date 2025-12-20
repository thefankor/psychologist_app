import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import { Button } from '@/components/custom';
import { Session } from '@/types/types';

interface SessionCardProps {
	session: Session;
	onJoin?: () => void;
	onCancel?: () => void;
	onReschedule?: () => void;
}

export const ProfileSessionCard = ({
	session,
	onJoin,
	onCancel,
	onReschedule,
}: SessionCardProps) => {
	const { psychologistName, date, time, type, isUpcoming, avatarUri } =
		session;

	return (
		<View style={styles.card}>
			<View style={styles.header}>
				<Image
					source={
						typeof avatarUri === 'string'
							? { uri: avatarUri }
							: avatarUri
					}
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
				disabled={!isUpcoming}
				pressColor='#3a6bf5'
				style={[styles.activeButton]}
				textStyle={[styles.activeButtonText]}
				onPress={isUpcoming ? onJoin : undefined}
			/>

			{!isUpcoming && (
				<View style={styles.pastActions}>
					<Button
						text='Отменить'
						pressColor='#eff0f6ff'
						style={styles.cancelButton}
						textStyle={styles.cancelText}
						onPress={onCancel}
					/>
					<View style={styles.separator} />
					<Button
						text='Перенести'
						pressColor='#eff0f6ff'
						style={styles.rescheduleButton}
						textStyle={styles.rescheduleText}
						onPress={onReschedule}
					/>
				</View>
			)}
		</View>
	);
};
