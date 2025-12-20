import { ProfileSessions } from '@/components/profile/profile-sessions/ProfileSessions';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Мои сессии'>
			<ProfileSessions />
		</ProfileLayout>
	);
}
