import { ScrollView, View, Image, Text } from 'react-native';
import { styles } from './styles';
import { useMenu } from './profile-menu/menu';
import ProfileMenu from './profile-menu/Profile-menu';
import { getUser } from '@/api/profile/profile';
import { getPsyshologistProfile } from '@/api/psychologists/psychologists';
import { getToken, getRole } from '@/helpers/helper';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/userSlice';
import { Loading } from '../custom/ui/Loading';

const Profile = () => {
	const menu = useMenu();
	const dispatch = useDispatch();
	const [userData, setUserData] = useState<any>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [role, setRole] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			loadProfile();
		}, []),
	);

	const loadProfile = async () => {
		const token = await getToken();
		if (!token) return;

		const userRole = await getRole();
		setRole(userRole);

		try {
			setLoading(true);

			let res;
			if (userRole === 'psychologist') {
				res = await getPsyshologistProfile(token);
			} else {
				res = await getUser(token);
			}

			setUserData(res);

			dispatch(
				setUser({
					id: res.id,
					name:
						res.name ||
						`${res.first_name || ''} ${res.last_name || ''}`.trim(),
					avatar: res.avatar,
				}),
			);
		} catch (err) {
			console.error('Ошибка загрузки профиля:', err);
		} finally {
			setLoading(false);
		}
	};

	const profileImage = userData.avatar
		? { uri: userData.avatar }
		: require('@/assets/images/avatar.png');

	const displayName =
		userData.name ||
		`${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
		'Пользователь';

	if (loading) {
		return <Loading />;
	}

	const menuSliceCount = role === 'psychologist' ? 2 : 4;

	return (
		<>
			<ScrollView
				style={styles.container}
				contentContainerStyle={{
					alignItems: 'center',
					paddingBottom: 80,
				}}
			>
				<Image source={profileImage} style={styles.container__avatar} />
				<Text style={styles.container__name}>{displayName}</Text>

				<View style={styles.container__menu}>
					<View
						style={[
							styles.container__section,
							styles.first,
							role === 'psychologist' && styles.psychologistFirst,
						]}
					>
						{menu.slice(0, menuSliceCount).map((item, index) => (
							<ProfileMenu
								key={index}
								{...item}
								disableBorder={index === menuSliceCount - 1}
							/>
						))}
					</View>

					<View style={[styles.container__section, styles.second]}>
						{menu.slice(4, 6).map((item, index) => (
							<ProfileMenu
								key={index}
								{...item}
								disableBorder={index === 1}
							/>
						))}
					</View>
				</View>
			</ScrollView>
		</>
	);
};

export default Profile;
