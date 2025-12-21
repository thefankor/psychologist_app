import ProfileFavorites from '@/components/profile/profile-favorites/ProfileFavorites';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Избранное'>
			<ProfileFavorites />
		</ProfileLayout>
	);
}
