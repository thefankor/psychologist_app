import { View } from 'react-native';
import { Survey } from '@/components/survey/Survey';

export default function SurveyPage() {
	return (
		<View style={{ flex: 1, justifyContent: 'center' }}>
			<Survey />
		</View>
	);
}
