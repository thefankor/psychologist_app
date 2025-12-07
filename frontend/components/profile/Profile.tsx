import { ScrollView, View, Image, Text } from 'react-native';
import { styles } from './styles';
import { useMenu } from './profile-menu/menu';
import ProfileMenu from './profile-menu/Profile-menu';
import { getUser } from '@/api/profile/profile';
import { useCallback, useState } from 'react';
import { getToken } from '@/helpers/helper';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/userSlice';

const Profile = () => {
	const menu = useMenu();
	const dispatch = useDispatch();
	const [userData, setUserData] = useState<any>({});

	useFocusEffect(
		useCallback(() => {
			getUserData();
		}, [])
	);

	const getUserData = async () => {
		const token = await getToken();
		if (!token) return;

		try {
			const res = await getUser(token);
			setUserData(res);

			dispatch(
				setUser({
					id: res.id,
					name: res.name,
					avatar: res.avatar,
				})
			);
		} catch (err) {
			console.error('Ошибка загрузки профиля', err);
		}
	};

	const profileImage = userData.avatar
		? { uri: userData.avatar }
		: require('@/assets/images/avatar.png');

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
				<Text style={styles.container__name}>{userData?.name}</Text>
				<View style={styles.container__menu}>
					<View style={[styles.container__section, styles.first]}>
						{menu.slice(0, 3).map((item, index) => (
							<ProfileMenu
								key={index}
								{...item}
								disableBorder={index === 2}
							/>
						))}
					</View>
					<View style={[styles.container__section, styles.second]}>
						{menu.slice(3, 5).map((item, index) => (
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
