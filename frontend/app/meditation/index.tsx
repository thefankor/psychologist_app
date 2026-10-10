import Meditation from '@/components/meditation/Meditation';

import Navigation from '@/components/navigation/Navigation';
import { View } from 'react-native';

export default function GroupsPage() {
	return (
		<View style={{ flex: 1 }}>
			<Meditation />
			<Navigation />
		</View>
	);
}
