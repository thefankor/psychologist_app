import {
	View,
	Pressable,
	Image,
	ScrollView,
	Dimensions,
	LayoutChangeEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useActions } from './group-actions/actions';
import GroupAction from './group-actions/Group-action';
import EnablePopup from '@/components/popups/enable-popup/EnablePopup';
import { useState, useRef } from 'react';

import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
	id: number;
}
interface InfoState {
	description: boolean;
	rules: boolean;
}

const GroupInfo = ({ id }: Props) => {
	const { actions } = useActions(id);
	const descriptionHeight = useSharedValue(0);
	const rulesHeight = useSharedValue(0);
	const [actionsPosition, setActionsPosition] = useState(0);
	const actionsRef = useRef<View>(null);

	const handleLayout = (event: LayoutChangeEvent) => {
		actionsRef.current?.measure((x, y, width, height, pageX, pageY) => {
			const screenHeight = Dimensions.get('window').height;
			const bottomPosition = screenHeight - pageY - height;
			setActionsPosition(bottomPosition);
		});
	};

	const [infoState, setInfoState] = useState<InfoState>({
		description: false,
		rules: false,
	});

	const [contentHeights, setContentHeights] = useState({
		description: { collapsed: 0, expanded: 0 },
		rules: { collapsed: 0, expanded: 0 },
	});

	const insets = useSafeAreaInsets();
	const { name, members, description, rules } = useSelector(
		(state: RootState) => state.group
	);

	const { isOpen, type } = useSelector(
		(state: RootState) => state.popup.generalInfo
	);

	const goBack = (id: number) => {
		router.push(`/groups/${id}`);
	};

	const handleOpen = (type: 'description' | 'rules') => {
		setInfoState((prev) => {
			const newState = {
				...prev,
				[type]: !prev[type],
			};

			if (type === 'description') {
				descriptionHeight.value = withTiming(
					newState.description
						? contentHeights.description.expanded
						: contentHeights.description.collapsed,
					{ duration: 500 }
				);
			} else {
				rulesHeight.value = withTiming(
					newState.rules
						? contentHeights.rules.expanded
						: contentHeights.rules.collapsed,
					{ duration: 500 }
				);
			}

			return newState;
		});
	};

	const measureContent = (type: 'description' | 'rules', layout: any) => {
		const { height } = layout;

		const collapsedHeight = 120;

		setContentHeights((prev) => ({
			...prev,
			[type]: {
				collapsed: collapsedHeight,
				expanded: height,
			},
		}));

		if (type === 'description') {
			descriptionHeight.value = collapsedHeight;
		} else {
			rulesHeight.value = collapsedHeight;
		}
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top + 4 }]}>
			<View style={styles.container__header}>
				<Pressable
					onPress={() => goBack(id)}
					style={styles.container__btn}
				>
					<Image
						source={require('@/assets/images/back.png')}
						style={styles.back__image}
					/>
				</Pressable>
			</View>
			<ScrollView
				style={styles.container__body}
				contentContainerStyle={{
					alignItems: 'center',
					paddingBottom: insets.bottom,
				}}
			>
				<Image
					source={require('@/assets/images/arsen.png')}
					style={styles.container__image}
				/>
				<Animated.Text style={styles.container__name}>
					{name}
				</Animated.Text>
				<Animated.Text style={styles.container__subtitle}>
					{members} участников
				</Animated.Text>
				<View
					style={styles.container__actions}
					ref={actionsRef}
					onLayout={handleLayout}
				>
					{actions.map((item, index) => (
						<GroupAction
							key={index}
							disabled={
								index === 0 && isOpen && type === 'enable'
							}
							{...item}
						/>
					))}
					{isOpen && type === 'enable' && (
						<EnablePopup
							bottom={actionsPosition + 15 - insets.top}
						/>
					)}
				</View>

				<View
					style={{ position: 'absolute', opacity: 0 }}
					onLayout={(event) =>
						measureContent('description', event.nativeEvent.layout)
					}
				>
					<View style={styles.container__info}>
						<Animated.Text style={styles.info__name}>
							Описание
						</Animated.Text>
						<Animated.Text style={styles.info__description}>
							{description}
						</Animated.Text>
						{description.length > 70 && (
							<Pressable style={styles.info__view}>
								<Animated.Text style={styles.view__title}>
									Скрыть
								</Animated.Text>
							</Pressable>
						)}
					</View>
				</View>

				<Animated.View
					style={[
						styles.container__info,
						{ height: descriptionHeight, overflow: 'hidden' },
					]}
				>
					<Animated.Text style={styles.info__name}>
						Описание
					</Animated.Text>
					<Animated.Text style={styles.info__description}>
						{infoState.description
							? description
							: `${description.substring(0, 70)}${
									description.length > 70 ? '...' : ''
							  }`}
					</Animated.Text>
					{description.length > 70 && (
						<Pressable
							style={styles.info__view}
							onPress={() => handleOpen('description')}
						>
							<Animated.Text style={styles.view__title}>
								{infoState.description
									? 'Скрыть'
									: 'Смотреть полностью'}
							</Animated.Text>
						</Pressable>
					)}
				</Animated.View>

				<Animated.View
					style={[
						styles.container__info,
						{
							height: rulesHeight,
							overflow: 'hidden',
							marginTop: 12,
						},
					]}
				>
					<Animated.Text style={styles.info__name}>
						Правила беседы
					</Animated.Text>
					<Animated.Text style={styles.info__description}>
						{infoState.rules
							? rules
							: `${rules.substring(0, 70)}${
									rules.length > 70 ? '...' : ''
							  }`}
					</Animated.Text>
					{rules.length > 70 && (
						<Pressable
							style={styles.info__view}
							onPress={() => handleOpen('rules')}
						>
							<Animated.Text style={styles.view__title}>
								{infoState.rules
									? 'Скрыть'
									: 'Смотреть полностью'}
							</Animated.Text>
						</Pressable>
					)}
				</Animated.View>
			</ScrollView>
		</View>
	);
};
export default GroupInfo;
