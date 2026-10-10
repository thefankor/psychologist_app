import { PsychologistAppointments } from '@/components/appointments/PsychologistAppointments';
import ProfileLayout from '@/components/profile/ProfileLayout';

export default function ProfilePage() {
	return (
		<ProfileLayout title='Мои данные'>
			<PsychologistAppointments />
		</ProfileLayout>
	);
}
