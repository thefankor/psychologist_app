import GroupInfo from '@/components/groups/group-content/group-info/Group-info';
import { useLocalSearchParams } from 'expo-router';

export default function InfoPage() {
	const searchParams = useLocalSearchParams();
	return <GroupInfo id={+searchParams.id} />;
}
