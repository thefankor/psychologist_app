import ProfileEdit from '@/components/profile/profile-edit/profile-edit';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Мои данные'>
			<ProfileEdit />
		</ProfileLayout>
	);
}
