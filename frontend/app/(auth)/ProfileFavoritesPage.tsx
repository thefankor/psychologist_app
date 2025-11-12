import ProfileFavorites from '@/components/profile/profile-favorites/profile-favorites';
import ProfileLayout from './ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout>
			<ProfileFavorites />
		</ProfileLayout>
	);
}
