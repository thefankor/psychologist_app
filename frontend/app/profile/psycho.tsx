import PsychologistProfileEdit from '@/components/edit/PsychologistProfileEdit';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Мои данные'>
			<PsychologistProfileEdit />
		</ProfileLayout>
	);
}
