import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { FormBlock } from '../form-block/FormBlock';
import { styles } from './styles';
import { Button } from '@/components/custom/ui/Button';
import { DefaultLabel, FormData, FormSteps } from '@/types/types';
import { BadgesPopup } from '@/components/popups/badges-popup/BadgesPopup';
import { UI } from '@/types/ui';

interface Props {
	setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
	formData: FormData;
	setStep: (step: FormSteps) => void;
}

export const FormDefault = ({ setFormData, formData, setStep }: Props) => {
	const [visible, setVisible] = useState<boolean>(false);
	const [activeLabel, setActiveLabel] = useState<DefaultLabel | null>(null);

	const handleActive = (label: DefaultLabel) => {
		setActiveLabel(label);
		setVisible(true);
	};

	return (
		<>
			<View style={styles.container}>
				<Text style={styles.form__title}>Что вас беспокоит?</Text>
				<Text style={styles.form__subtitle}>
					Выберите одну из нескольких тем
				</Text>

				<ScrollView
					style={styles.form__scroll}
					contentContainerStyle={styles.form__scrollContainer}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.form__wrap}>
						<FormBlock
							title='Эмоциональное состояние'
							checkbox
							badges={[...formData[DefaultLabel.EMOTIONS]]}
							size={16}
							isActive={
								formData[DefaultLabel.EMOTIONS]?.length > 0
							}
							onPress={() => handleActive(DefaultLabel.EMOTIONS)}
							isAdd
						/>
						<FormBlock
							title='Отношения'
							checkbox
							badges={[...formData[DefaultLabel.RELATIONS]]}
							size={16}
							secondStyles={styles.form__block}
							isActive={
								formData[DefaultLabel.RELATIONS]?.length > 0
							}
							onPress={() => handleActive(DefaultLabel.RELATIONS)}
							isAdd
						/>
						<FormBlock
							title='Работа, учеба'
							checkbox
							badges={[...formData[DefaultLabel.WORK]]}
							secondStyles={styles.form__block}
							size={16}
							isActive={formData[DefaultLabel.WORK]?.length > 0}
							onPress={() => handleActive(DefaultLabel.WORK)}
							isAdd
						/>
						<FormBlock
							title='Жизненные обстоятельства'
							checkbox
							secondStyles={styles.form__block}
							size={16}
							badges={[...formData[DefaultLabel.LIFE]]}
							isActive={formData[DefaultLabel.LIFE]?.length > 0}
							onPress={() => handleActive(DefaultLabel.LIFE)}
							isAdd
						/>
						<FormBlock
							title='Личностное развитие'
							checkbox
							secondStyles={styles.form__block}
							size={16}
							badges={[...formData[DefaultLabel.PERSONAL]]}
							isActive={
								formData[DefaultLabel.PERSONAL]?.length > 0
							}
							onPress={() => handleActive(DefaultLabel.PERSONAL)}
							isAdd
						/>
					</View>
					<Button
						text='Далее'
						style={UI.styles.continueButton}
						textStyle={UI.styles.continueText}
						pressColor={UI.colors.pressableColor}
						onPress={() => setStep(FormSteps.STEP_TWO)}
					/>
				</ScrollView>

				<BadgesPopup
					visible={visible}
					setVisible={setVisible}
					formData={formData}
					setFormData={setFormData}
					activeLabel={activeLabel}
				/>
			</View>
		</>
	);
};
