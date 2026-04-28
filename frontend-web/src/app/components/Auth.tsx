import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
	Mail,
	KeyRound,
	ArrowLeft,
	Loader2,
	User,
	BrainCircuit,
	ChevronRight,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { getVerifyCode, checkVerifyCode } from '../../api/auth';
import { getUser, sendUserData } from '../../api/profile';
import {
	getPsyshologistProfile,
	updatePsyshologistProfile,
} from '../../api/psychologist';

type Step = 'role' | 'email' | 'code' | 'survey';
type Role = 'client' | 'psychologist';

const METHODS = [
	{ value: 'GESTALT', label: 'Гештальт' },
	{ value: 'PSYHODRAM', label: 'Психодрама' },
	{ value: 'PSYHOANALISE', label: 'Психоанализ' },
	{ value: 'EXISTENAL', label: 'Экзистенциальная' },
	{ value: 'SYSTEM', label: 'Системная' },
];

const GENDERS = [
	{ value: 'NOT_STATED', label: 'Не указан' },
	{ value: 'MALE', label: 'Мужской' },
	{ value: 'FEMALE', label: 'Женский' },
];

const validateEmail = (v: string) => {
	if (!v.trim()) return 'Email обязателен';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
		return 'Введите корректный email';
	return '';
};

const validateCode = (v: string) => {
	if (!v.trim()) return 'Код обязателен';
	if (!/^\d{5}$/.test(v)) return 'Код должен содержать 5 цифр';
	return '';
};

const inputClass = (error?: string) =>
	`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error ? 'border-red-500 dark:border-red-500' : ''}`;

function GenderSelector({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div className='flex gap-2'>
			{GENDERS.map((g) => (
				<button
					key={g.value}
					type='button'
					onClick={() => onChange(g.value)}
					className={`flex-1 py-2 px-3 rounded-md border text-sm transition-colors cursor-pointer ${
						value === g.value
							? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
							: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
					}`}
				>
					{g.label}
				</button>
			))}
		</div>
	);
}

export default function Auth() {
	const navigate = useNavigate();
	const [step, setStep] = useState<Step>('role');
	const [role, setRole] = useState<Role>('client');
	const [email, setEmail] = useState('');
	const [code, setCode] = useState('');
	const [token, setToken] = useState('');
	const [emailError, setEmailError] = useState('');
	const [codeError, setCodeError] = useState('');
	const [loading, setLoading] = useState(false);
	const [surveyErrors, setSurveyErrors] = useState<Record<string, string>>(
		{},
	);

	const [clientName, setClientName] = useState('');
	const [clientBirthDate, setClientBirthDate] = useState('');
	const [clientGender, setClientGender] = useState('NOT_STATED');

	const [psychFirstName, setPsychFirstName] = useState('');
	const [psychLastName, setPsychLastName] = useState('');
	const [psychExperience, setPsychExperience] = useState('');
	const [psychPrice, setPsychPrice] = useState('');
	const [psychGender, setPsychGender] = useState('NOT_STATED');
	const [psychMethods, setPsychMethods] = useState<string[]>([]);

	useEffect(() => {
		if (localStorage.getItem('token')) navigate('/');
	}, [navigate]);

	const handleSendCode = async () => {
		const err = validateEmail(email);
		if (err) {
			setEmailError(err);
			return;
		}
		setLoading(true);
		try {
			await getVerifyCode(email);
			setStep('code');
		} catch (e: any) {
			setEmailError(e.message || 'Ошибка при отправке кода');
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyCode = async () => {
		const err = validateCode(code);
		if (err) {
			setCodeError(err);
			return;
		}
		setLoading(true);
		try {
			const data = await checkVerifyCode(email, code, role);
			const newToken = data.token;
			setToken(newToken);

			if (role === 'client') {
				const profile = await getUser(newToken);
				if (profile.name) {
					localStorage.setItem('token', newToken);
					navigate('/psychologists');
				} else {
					setStep('survey');
				}
			} else {
				const profile = await getPsyshologistProfile(newToken);
				if (profile.first_name) {
					localStorage.setItem('token', newToken);
					navigate('/');
				} else {
					setStep('survey');
				}
			}
		} catch (e: any) {
			setCodeError(e.message || 'Неверный код подтверждения');
		} finally {
			setLoading(false);
		}
	};

	const clearSurveyError = (field: string) =>
		setSurveyErrors((prev) => ({ ...prev, [field]: '' }));

	const handleSubmitClientSurvey = async () => {
		const errors: Record<string, string> = {};
		if (!clientName.trim()) errors.name = 'Имя обязательно';
		if (!clientBirthDate) errors.birth_date = 'Дата рождения обязательна';
		if (Object.keys(errors).length > 0) {
			setSurveyErrors(errors);
			return;
		}
		setLoading(true);
		try {
			await sendUserData(token, {
				name: clientName.trim(),
				birth_date: new Date(clientBirthDate).toISOString(),
				gender: clientGender,
			});
			localStorage.setItem('token', token);
			navigate('/psychologists');
		} catch (e: any) {
			setSurveyErrors({
				submit: e.message || 'Ошибка при сохранении анкеты',
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitPsychSurvey = async () => {
		const errors: Record<string, string> = {};
		if (!psychFirstName.trim()) errors.first_name = 'Имя обязательно';
		if (!psychLastName.trim()) errors.last_name = 'Фамилия обязательна';
		if (Object.keys(errors).length > 0) {
			setSurveyErrors(errors);
			return;
		}
		setLoading(true);
		try {
			await updatePsyshologistProfile(token, {
				first_name: psychFirstName.trim(),
				last_name: psychLastName.trim(),
				...(psychExperience && {
					experience: parseInt(psychExperience),
				}),
				...(psychPrice && { price: parseInt(psychPrice) }),
				...(psychGender !== 'NOT_STATED' && { gender: psychGender }),
				...(psychMethods.length > 0 && { methods: psychMethods }),
			});
			localStorage.setItem('token', token);
			navigate('/');
		} catch (e: any) {
			setSurveyErrors({
				submit: e.message || 'Ошибка при сохранении профиля',
			});
		} finally {
			setLoading(false);
		}
	};

	const toggleMethod = (method: string) =>
		setPsychMethods((prev) =>
			prev.includes(method)
				? prev.filter((m) => m !== method)
				: [...prev, method],
		);

	const titles: Record<Step, string> = {
		role: 'Добро пожаловать',
		email: 'Вход в систему',
		code: 'Подтверждение',
		survey: 'Заполните анкету',
	};

	const descriptions: Record<Step, string> = {
		role: 'Выберите вашу роль для входа',
		email: 'Введите ваш email для получения кода',
		code: `Код отправлен на ${email}`,
		survey:
			role === 'client'
				? 'Расскажите немного о себе'
				: 'Заполните профиль психолога',
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4'>
			<Card className='w-full max-w-md dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
						{titles[step]}
					</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						{descriptions[step]}
					</CardDescription>
				</CardHeader>

				<CardContent className='space-y-4'>
					{step === 'role' && (
						<>
							<button
								onClick={() => {
									setRole('client');
									setStep('email');
								}}
								className='w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group'
							>
								<div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0'>
									<User className='w-5 h-5 text-blue-600 dark:text-blue-400' />
								</div>
								<div className='flex-1 cursor-pointer'>
									<div className='font-medium text-gray-900 dark:text-white'>
										Я клиент
									</div>
									<div className='text-sm text-gray-500 dark:text-gray-400'>
										Ищу психолога для консультаций
									</div>
								</div>
								<ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors' />
							</button>

							<button
								onClick={() => {
									setRole('psychologist');
									setStep('email');
								}}
								className='w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group'
							>
								<div className='w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0'>
									<BrainCircuit className='w-5 h-5 text-purple-600 dark:text-purple-400' />
								</div>
								<div className='flex-1 cursor-pointer'>
									<div className='font-medium text-gray-900 dark:text-white'>
										Я психолог
									</div>
									<div className='text-sm text-gray-500 dark:text-gray-400'>
										Веду приём клиентов
									</div>
								</div>
								<ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors' />
							</button>
						</>
					)}

					{step === 'email' && (
						<>
							<div className='space-y-2'>
								<Label
									htmlFor='email'
									className='dark:text-gray-200'
								>
									Email
								</Label>
								<div className='relative'>
									<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
									<Input
										id='email'
										type='email'
										placeholder='example@mail.ru'
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setEmailError('');
										}}
										onKeyDown={(e) =>
											e.key === 'Enter' &&
											handleSendCode()
										}
										className={`pl-10 ${inputClass(emailError)}`}
									/>
								</div>
								{emailError && (
									<p className='text-sm text-red-500'>
										{emailError}
									</p>
								)}
							</div>
							<Button
								onClick={handleSendCode}
								disabled={loading}
								className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
							>
								{loading && (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								)}
								Отправить код
							</Button>
							<Button
								variant='ghost'
								onClick={() => setStep('role')}
								className='w-full dark:text-gray-300 dark:hover:text-white'
							>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Назад
							</Button>
						</>
					)}

					{step === 'code' && (
						<>
							<div className='space-y-2'>
								<Label
									htmlFor='code'
									className='dark:text-gray-200'
								>
									Код подтверждения
								</Label>
								<div className='relative'>
									<KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
									<Input
										id='code'
										type='text'
										placeholder='12345'
										value={code}
										maxLength={5}
										onChange={(e) => {
											setCode(
												e.target.value.replace(
													/\D/g,
													'',
												),
											);
											setCodeError('');
										}}
										onKeyDown={(e) =>
											e.key === 'Enter' &&
											handleVerifyCode()
										}
										className={`pr-5 tracking-widest text-center text-lg ${inputClass(codeError)}`}
									/>
								</div>
								{codeError && (
									<p className='text-sm text-red-500'>
										{codeError}
									</p>
								)}
							</div>
							<Button
								onClick={handleVerifyCode}
								disabled={loading}
								className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
							>
								{loading && (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								)}
								Подтвердить
							</Button>
							<Button
								variant='ghost'
								onClick={() => {
									setStep('email');
									setCode('');
									setCodeError('');
								}}
								className='w-full dark:text-gray-300 dark:hover:text-white'
							>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Изменить email
							</Button>
						</>
					)}

					{step === 'survey' && role === 'client' && (
						<>
							<div className='space-y-2'>
								<Label
									htmlFor='name'
									className='dark:text-gray-200'
								>
									Имя <span className='text-red-500'>*</span>
								</Label>
								<Input
									id='name'
									placeholder='Иван'
									value={clientName}
									onChange={(e) => {
										setClientName(e.target.value);
										clearSurveyError('name');
									}}
									className={inputClass(surveyErrors.name)}
								/>
								{surveyErrors.name && (
									<p className='text-sm text-red-500'>
										{surveyErrors.name}
									</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label
									htmlFor='birth_date'
									className='dark:text-gray-200 '
								>
									Дата рождения{' '}
									<span className='text-red-500'>*</span>
								</Label>
								<Input
									id='birth_date'
									type='date'
									value={clientBirthDate}
									onChange={(e) => {
										setClientBirthDate(e.target.value);
										clearSurveyError('birth_date');
									}}
									className={inputClass(
										surveyErrors.birth_date,
									)}
								/>
								{surveyErrors.birth_date && (
									<p className='text-sm text-red-500'>
										{surveyErrors.birth_date}
									</p>
								)}
							</div>

							<div className='space-y-2'>
								<Label className='dark:text-gray-200'>
									Пол
								</Label>
								<GenderSelector
									value={clientGender}
									onChange={setClientGender}
								/>
							</div>

							{surveyErrors.submit && (
								<p className='text-sm text-red-500'>
									{surveyErrors.submit}
								</p>
							)}
							<Button
								onClick={handleSubmitClientSurvey}
								disabled={loading}
								className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
							>
								{loading && (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								)}
								Сохранить и продолжить
							</Button>
						</>
					)}

					{step === 'survey' && role === 'psychologist' && (
						<>
							<div className='grid grid-cols-2 gap-3'>
								<div className='space-y-2'>
									<Label
										htmlFor='first_name'
										className='dark:text-gray-200'
									>
										Имя{' '}
										<span className='text-red-500'>*</span>
									</Label>
									<Input
										id='first_name'
										placeholder='Иван'
										value={psychFirstName}
										onChange={(e) => {
											setPsychFirstName(e.target.value);
											clearSurveyError('first_name');
										}}
										className={inputClass(
											surveyErrors.first_name,
										)}
									/>
									{surveyErrors.first_name && (
										<p className='text-sm text-red-500'>
											{surveyErrors.first_name}
										</p>
									)}
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='last_name'
										className='dark:text-gray-200'
									>
										Фамилия{' '}
										<span className='text-red-500'>*</span>
									</Label>
									<Input
										id='last_name'
										placeholder='Иванов'
										value={psychLastName}
										onChange={(e) => {
											setPsychLastName(e.target.value);
											clearSurveyError('last_name');
										}}
										className={inputClass(
											surveyErrors.last_name,
										)}
									/>
									{surveyErrors.last_name && (
										<p className='text-sm text-red-500'>
											{surveyErrors.last_name}
										</p>
									)}
								</div>
							</div>

							<div className='grid grid-cols-2 gap-3'>
								<div className='space-y-2'>
									<Label
										htmlFor='experience'
										className='dark:text-gray-200'
									>
										Опыт (лет)
									</Label>
									<Input
										id='experience'
										type='number'
										min='0'
										placeholder='5'
										value={psychExperience}
										onChange={(e) =>
											setPsychExperience(e.target.value)
										}
										className={inputClass()}
									/>
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='price'
										className='dark:text-gray-200'
									>
										Цена (₽/сессия)
									</Label>
									<Input
										id='price'
										type='number'
										min='0'
										placeholder='3000'
										value={psychPrice}
										onChange={(e) =>
											setPsychPrice(e.target.value)
										}
										className={inputClass()}
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label className='dark:text-gray-200'>
									Пол
								</Label>
								<GenderSelector
									value={psychGender}
									onChange={setPsychGender}
								/>
							</div>

							<div className='space-y-2'>
								<Label className='dark:text-gray-200'>
									Методы работы
								</Label>
								<div className='flex flex-wrap gap-2'>
									{METHODS.map((m) => (
										<button
											key={m.value}
											type='button'
											onClick={() =>
												toggleMethod(m.value)
											}
											className={`py-1.5 px-3 rounded-full border text-sm transition-colors cursor-pointer ${
												psychMethods.includes(m.value)
													? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
													: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
											}`}
										>
											{m.label}
										</button>
									))}
								</div>
							</div>

							{surveyErrors.submit && (
								<p className='text-sm text-red-500'>
									{surveyErrors.submit}
								</p>
							)}
							<Button
								onClick={handleSubmitPsychSurvey}
								disabled={loading}
								className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
							>
								{loading && (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								)}
								Сохранить и начать работу
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
