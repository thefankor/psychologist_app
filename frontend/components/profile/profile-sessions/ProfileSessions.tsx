import { View, Text, ScrollView } from 'react-native';
import { styles } from './styles';
import { ProfileSessionCard } from './profile-sessions-card/ProfileSessionCard';
import { useEffect, useState } from 'react';
import { getToken } from '@/helpers/helper';
import { Loading } from '@/components/custom/ui/Loading';
import { getAllAppointments } from '@/api/psychologists/psychologists';
import { Session } from '@/types/types';
import { useRouter } from 'expo-router';

export const ProfileSessions = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<Session[]>([]);
	const router = useRouter();
	useEffect(() => {
		getAppointments();
	}, []);

	const makeCall = async () => {
		router.push('https://telemost.yandex.ru/j/69855969084365');
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
							role='PSYCHOLOGIST'
						/>
					))
				)}
			</ScrollView>
		</View>
	);
};
