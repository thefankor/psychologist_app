import { useCallback, useState } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { styles } from './styles';
import { Loading } from '@/components/custom/ui/Loading';
import { getToken } from '@/helpers/helper';
import { getPaymentMethods, deletePaymentMethod } from '@/api/payment/payment';
import { methods } from './methodItems';

interface SbpMethod {
	id: number;
	phone: string;
	bank: string;
}

interface PaymentMethodsResponse {
	sbp: SbpMethod[];
}

const ProfileMethods = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [sbpMethods, setSbpMethods] = useState<SbpMethod[]>([]);

	useFocusEffect(
		useCallback(() => {
			getMethods();
		}, [])
	);

	const getMethods = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			if (!token) return;

			const res: PaymentMethodsResponse = await getPaymentMethods(token);

			if (res?.sbp) {
				setSbpMethods(res.sbp);
			}
		} catch (error) {
			console.log('Ошибка загрузки методов оплаты:', error);
		} finally {
			setLoading(false);
		}
	};

	const getBankIcon = (bankName: string) => {
		const method = methods.find(
			(m) => m.bank.toLowerCase() === bankName.toLowerCase()
		);
		return method ? method.image : require('@/assets/images/search.png');
	};

	const handleAddMethod = () => {
		router.push('/profile/add');
	};

	const handleDeleteMethod = (id: number) => {
		Alert.alert(
			'Удаление счета',
			'Вы уверены, что хотите удалить этот способ оплаты?',
			[
				{
					text: 'Отмена',
					style: 'cancel',
				},
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: async () => {
						try {
							const token = await getToken();
							if (!token) return;

							await deletePaymentMethod(token, id);
							getMethods();
						} catch (error) {
							console.log('Ошибка при удалении метода:', error);
							Alert.alert(
								'Ошибка',
								'Не удалось удалить способ оплаты'
							);
						}
					},
				},
			]
		);
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.container__title}>СБП оплата</Text>

			{sbpMethods.map((method) => (
				<View key={method.id} style={styles.container__method}>
					<View style={styles.link__method}>
						<View style={styles.method__wrap}>
							<Image
								source={getBankIcon(method.bank)}
								style={styles.method__image}
							/>
							<Text style={styles.method__text}>
								{method.bank}
							</Text>
						</View>

						<Pressable
							onPress={() => handleDeleteMethod(method.id)}
							hitSlop={10}
						>
							<Image
								source={require('@/assets/images/delete.png')}
								style={styles.method__image}
							/>
						</Pressable>
					</View>
				</View>
			))}

			<View style={styles.container__method}>
				<Pressable
					style={styles.link__method}
					onPress={handleAddMethod}
				>
					<View style={styles.method__wrap}>
						<Image
							source={require('@/assets/images/sbp.png')}
							style={styles.method__image}
						/>
						<Text style={styles.method__text}>
							Добавить счет СБП
						</Text>
					</View>
					<Image
						source={require('@/assets/images/right.png')}
						style={styles.method__image}
					/>
				</Pressable>
			</View>
		</View>
	);
};

export default ProfileMethods;
