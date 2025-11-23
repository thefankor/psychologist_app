import Profile from '@/components/profile/Profile';
import ProfileLayout from './ProfileLayout';
import Navigation from '@/components/navigation/Navigation';
import { View } from 'react-native';

export default function ProfilePage() {
	return (
		<View>
			<ProfileLayout>
				<Profile />
			</ProfileLayout>
			<Navigation />
		</View>
	);
}
