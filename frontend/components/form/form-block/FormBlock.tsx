import { View, Text, ViewStyle, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';
import { Checkbox } from '@/components/custom/ui/CheckBox';

interface Props {
	title?: string;
	subtitle?: string;
	description?: string;
	other?: string;
	badges?: string[];
	isActive?: boolean;
	size?: number;
	radio?: boolean;
	checkbox?: boolean;
	secondStyles?: ViewStyle;
	onPress?: () => void;
	isAdd?: boolean;
	isSelect?: boolean;
}

export const FormBlock = ({
	title,
	subtitle,
	description,
	other,
	badges,
	isActive,
	radio,
	checkbox,
	size,
	secondStyles,
	onPress,
	isAdd,
}: Props) => {
	return (
		<TouchableOpacity
			style={[
				styles.form__block,
				secondStyles,
				isActive && styles.active,
				isAdd && styles.add__class,
				other && styles.add__class,
			]}
			onPress={onPress}
			activeOpacity={0.7}
		>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{title && (
						<Text style={[styles.form__title, { fontSize: size }]}>
							{title}
						</Text>
					)}
					{other && <Text style={styles.form__other}>{other}</Text>}
				</View>

				{(checkbox || radio) && (
					<Checkbox
						isActive={isActive}
						onPress={onPress}
						radio={radio}
					/>
				)}
			</View>
			{isAdd && badges?.length === 0 && (
				<View style={styles.add__wrap}>
					<View style={styles.plus}>
						<Image
							style={styles.plus__image}
							source={require('@/assets/images/plus.png')}
						/>
					</View>
					<Text style={styles.add__text}>Добавить</Text>
				</View>
			)}
			{badges?.length !== 0 && badges && (
				<View style={styles.badges__wrap}>
					{badges.map((item, index) => (
						<View
							style={[
								styles.form__badge,
								title === 'Эмоциональное состояние'
									? styles.emotion
									: title === 'Отношения'
									? styles.relations
									: title === 'Работа, учеба'
									? styles.work
									: title === 'Жизненные обстоятельства'
									? styles.life
									: title === 'Личностное развитие'
									? styles.personal
									: '',
							]}
							key={index}
						>
							<Text
								style={[
									styles.badge__text,
									title === 'Эмоциональное состояние'
										? styles.emotion__text
										: title === 'Отношения'
										? styles.relations__text
										: title === 'Работа, учеба'
										? styles.work__text
										: title === 'Жизненные обстоятельства'
										? styles.life__text
										: title === 'Личностное развитие'
										? styles.personal__text
										: '',
								]}
							>
								{item}
							</Text>
						</View>
					))}
					{badges.length >= 4 ? (
						<></>
					) : (
						<View style={styles.add__wrap}>
							<View style={styles.plus}>
								<Image
									style={styles.plus__image}
									source={require('@/assets/images/plus.png')}
								/>
							</View>
							<Text style={styles.add__text}>Добавить</Text>
						</View>
					)}
				</View>
			)}
			{subtitle && <Text>{subtitle}</Text>}
			{description && (
				<Text style={styles.form__description}>{description}</Text>
			)}
		</TouchableOpacity>
	);
};
