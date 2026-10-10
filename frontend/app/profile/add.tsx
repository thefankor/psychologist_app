import AddProfileMethod from '@/components/profile/profile-methods/profile-methods-add/AddProfileMethod';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Добавить метод'>
			<AddProfileMethod />
		</ProfileLayout>
	);
}
