import GroupContent from '@/components/groups/group-content/Group-content';
import { useLocalSearchParams } from 'expo-router';

const CurrentGroupPage = () => {
	const { id } = useLocalSearchParams<{ id: string }>();

	return <GroupContent id={id} />;
};

export default CurrentGroupPage;
