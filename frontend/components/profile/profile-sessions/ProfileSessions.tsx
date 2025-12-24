import { View, Text, ScrollView } from 'react-native';
import { styles } from './styles';
import { ProfileSessionCard } from './profile-sessions-card/ProfileSessionCard';
import { useEffect, useState } from 'react';
import { createCall } from '@/api/calls/calls';
import { getToken } from '@/helpers/helper';
import { randomUUID } from 'expo-crypto';
import { Loading } from '@/components/custom/ui/Loading';
import { getAllAppointments } from '@/api/psychologists/psychologists';
import { Session } from '@/types/types';

const mockSessions = [
	{
		id: 1,
		psychologistName: 'Анастасия Степанова',
		date: '7 дек 2025 г. (Вс)',
		time: '22:45',
		type: 'Индивидуальная сессия',
		isUpcoming: true,
		avatarUri: 'https://randomuser.me/api/portraits/women/46.jpg',
	},
	{
		id: 2,
		psychologistName: 'Арсен Маркарян',
		date: 'Вряд ли получится',
		time: '24:59',
		type: 'Связь с космосом',
		isUpcoming: false,
		avatarUri: require('@/assets/images/arsen.png'),
	},
];

export const ProfileSessions = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<Session[]>([]);

	useEffect(() => {
		getAppointments();
	}, []);

	const makeCall = async () => {
		try {
			setLoading(true);
			const localId = randomUUID();
			const token = await getToken();
			const res = await createCall(token!, localId);
			console.log(res);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const getAppointments = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			const res = await getAllAppointments(token!);
			if (res) {
				setData(res);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<View style={styles.container}>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{data.length === 0 ? (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							У вас пока нет сессий
						</Text>
					</View>
				) : (
					data.map((session) => (
						<ProfileSessionCard
							key={session.id}
							session={session}
							onJoin={makeCall}
						/>
					))
				)}
			</ScrollView>
		</View>
	);
};
