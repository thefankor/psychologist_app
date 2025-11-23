import GroupContent from '@/components/groups/group-content/Group-content';
import { useLocalSearchParams } from 'expo-router';

const CurrentGroupPage = () => {
	const searchParams = useLocalSearchParams();

	return <GroupContent id={+searchParams.id} />;
};
export default CurrentGroupPage;
