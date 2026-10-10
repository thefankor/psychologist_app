import { View } from 'react-native';
import { Psychologists } from '@/components/psychologists/Psychologists';
import Navigation from '@/components/navigation/Navigation';

export default function PsychologistsPage() {
	return (
		<View style={{ flex: 1, backgroundColor: '#F5F8FF' }}>
			<Psychologists />
			<Navigation />
		</View>
	);
}
