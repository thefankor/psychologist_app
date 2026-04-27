import { useEffect, useState } from 'react';
import { Loader2, Save, User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useUser } from '../context/UserContext';
import { updateUser } from '../../api/profile';
import { updatePsyshologistProfile } from '../../api/psychologist';

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

const TIMEZONES = [
	{ value: 'UTC_12_M', label: 'UTC−12' },
	{ value: 'UTC_11_M', label: 'UTC−11' },
	{ value: 'UTC_10_M', label: 'UTC−10' },
	{ value: 'UTC_9_M', label: 'UTC−9' },
	{ value: 'UTC_8_M', label: 'UTC−8' },
	{ value: 'UTC_7_M', label: 'UTC−7' },
	{ value: 'UTC_6_M', label: 'UTC−6' },
	{ value: 'UTC_5_M', label: 'UTC−5' },
	{ value: 'UTC_4_M', label: 'UTC−4' },
	{ value: 'UTC_3_M', label: 'UTC−3' },
	{ value: 'UTC_2_M', label: 'UTC−2' },
	{ value: 'UTC_1_M', label: 'UTC−1' },
	{ value: 'UTC', label: 'UTC±0' },
	{ value: 'UTC_1_P', label: 'UTC+1' },
	{ value: 'UTC_2_P', label: 'UTC+2' },
	{ value: 'UTC_3_P', label: 'UTC+3 (Москва)' },
	{ value: 'UTC_4_P', label: 'UTC+4 (Самара)' },
	{ value: 'UTC_5_P', label: 'UTC+5 (Екатеринбург)' },
	{ value: 'UTC_6_P', label: 'UTC+6 (Омск)' },
	{ value: 'UTC_7_P', label: 'UTC+7 (Красноярск)' },
	{ value: 'UTC_8_P', label: 'UTC+8 (Иркутск)' },
	{ value: 'UTC_9_P', label: 'UTC+9 (Якутск)' },
	{ value: 'UTC_10_P', label: 'UTC+10 (Владивосток)' },
	{ value: 'UTC_11_P', label: 'UTC+11 (Магадан)' },
	{ value: 'UTC_12_P', label: 'UTC+12 (Камчатка)' },
	{ value: 'UTC_13_P', label: 'UTC+13' },
	{ value: 'UTC_14_P', label: 'UTC+14' },
];

const inputCls = 'dark:bg-gray-700 dark:border-gray-600 dark:text-white';
const selectCls =
	'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer';

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

function ClientProfile() {
	const { profile, refreshProfile } = useUser();
	const d = profile?.data;

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [birthDate, setBirthDate] = useState('');
	const [gender, setGender] = useState('NOT_STATED');
	const [timezone, setTimezone] = useState('');

	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!d) return;
		setName(d.name ?? '');
		setEmail(d.email ?? '');
		setPhone(d.phone ?? '');
		setBirthDate(d.birth_date ? d.birth_date.toString().slice(0, 10) : '');
		setGender(d.gender ?? 'NOT_STATED');
		setTimezone(d.timezone ?? '');
	}, [d]);

	const handleSave = async () => {
		const token = localStorage.getItem('token') ?? '';
		setSaving(true);
		setError('');
		setSuccess(false);
		try {
			await updateUser(token, {
				name: name.trim() || null,
				email: email.trim() || null,
				phone: phone.trim() || null,
				birth_date: birthDate
					? new Date(birthDate).toISOString()
					: null,
				gender: gender || null,
				timezone: timezone || null,
			});
			await refreshProfile();
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (e: any) {
			setError(e.message || 'Ошибка при сохранении');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className='space-y-6'>
			<Card className='dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader className='flex flex-row items-center gap-3 pb-4'>
					<div className='w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center'>
						<User className='w-5 h-5 text-blue-600 dark:text-blue-400' />
					</div>
					<CardTitle className='text-lg dark:text-white'>
						Личные данные
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>Имя</Label>
							<Input
								placeholder='Иван'
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>Email</Label>
							<Input
								type='email'
								placeholder='example@mail.ru'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Телефон
							</Label>
							<Input
								placeholder='+79991234567'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Дата рождения
							</Label>
							<Input
								type='date'
								value={birthDate}
								onChange={(e) => setBirthDate(e.target.value)}
								className={inputCls}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>Пол</Label>
						<GenderSelector value={gender} onChange={setGender} />
					</div>

					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>
							Часовой пояс
						</Label>
						<select
							value={timezone}
							onChange={(e) => setTimezone(e.target.value)}
							className={selectCls}
						>
							<option value=''>Не указан</option>
							{TIMEZONES.map((tz) => (
								<option key={tz.value} value={tz.value}>
									{tz.label}
								</option>
							))}
						</select>
					</div>
				</CardContent>
			</Card>

			{error && (
				<p className='text-sm text-red-500 text-center'>{error}</p>
			)}
			{success && (
				<p className='text-sm text-green-600 dark:text-green-400 text-center'>
					Данные успешно сохранены
				</p>
			)}

			<Button
				onClick={handleSave}
				disabled={saving}
				className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
			>
				{saving ? (
					<Loader2 className='w-4 h-4 mr-2 animate-spin' />
				) : (
					<Save className='w-4 h-4 mr-2' />
				)}
				Сохранить изменения
			</Button>
		</div>
	);
}

function PsychologistProfile() {
	const { profile, refreshProfile } = useUser();
	const d = profile?.data;

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [gender, setGender] = useState('NOT_STATED');
	const [age, setAge] = useState('');
	const [experience, setExperience] = useState('');
	const [price, setPrice] = useState('');
	const [methods, setMethods] = useState<string[]>([]);

	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!d) return;
		setFirstName(d.first_name ?? '');
		setLastName(d.last_name ?? '');
		setEmail(d.email ?? '');
		setGender(d.gender ?? 'NOT_STATED');
		setAge(d.age != null ? String(d.age) : '');
		setExperience(d.experience != null ? String(d.experience) : '');
		setPrice(d.price != null ? String(d.price) : '');
		setMethods(d.methods ?? []);
	}, [d]);

	const toggleMethod = (method: string) =>
		setMethods((prev) =>
			prev.includes(method)
				? prev.filter((m) => m !== method)
				: [...prev, method],
		);

	const handleSave = async () => {
		if (!firstName.trim() || !lastName.trim()) {
			setError('Имя и фамилия обязательны');
			return;
		}
		const token = localStorage.getItem('token') ?? '';
		setSaving(true);
		setError('');
		setSuccess(false);
		try {
			await updatePsyshologistProfile(token, {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim() || null,
				gender: gender !== 'NOT_STATED' ? gender : null,
				age: age ? parseInt(age) : null,
				experience: experience ? parseInt(experience) : null,
				price: price ? parseInt(price) : null,
				methods: methods.length > 0 ? methods : null,
			});
			await refreshProfile();
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (e: any) {
			setError(e.message || 'Ошибка при сохранении');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className='space-y-6'>
			<Card className='dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader className='flex flex-row items-center gap-3 pb-4'>
					<div className='w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center'>
						<User className='w-5 h-5 text-blue-600 dark:text-blue-400' />
					</div>
					<CardTitle className='text-lg dark:text-white'>
						Личные данные
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Имя <span className='text-red-500'>*</span>
							</Label>
							<Input
								placeholder='Иван'
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Фамилия <span className='text-red-500'>*</span>
							</Label>
							<Input
								placeholder='Иванов'
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>Email</Label>
							<Input
								type='email'
								placeholder='doctor@mail.ru'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Возраст
							</Label>
							<Input
								type='number'
								min='18'
								max='100'
								placeholder='35'
								value={age}
								onChange={(e) => setAge(e.target.value)}
								className={inputCls}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label className='dark:text-gray-200'>Пол</Label>
						<GenderSelector value={gender} onChange={setGender} />
					</div>
				</CardContent>
			</Card>

			<Card className='dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader className='flex flex-row items-center gap-3 pb-4'>
					<div className='w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center'>
						<Briefcase className='w-5 h-5 text-purple-600 dark:text-purple-400' />
					</div>
					<CardTitle className='text-lg dark:text-white'>
						Профессиональные данные
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Опыт (лет)
							</Label>
							<Input
								type='number'
								min='0'
								placeholder='5'
								value={experience}
								onChange={(e) => setExperience(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div className='space-y-2'>
							<Label className='dark:text-gray-200'>
								Цена (₽/сессия)
							</Label>
							<Input
								type='number'
								min='0'
								placeholder='3000'
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								className={inputCls}
							/>
						</div>
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
									onClick={() => toggleMethod(m.value)}
									className={`py-1.5 px-4 rounded-full border text-sm transition-colors ${
										methods.includes(m.value)
											? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400'
											: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
									}`}
								>
									{m.label}
								</button>
							))}
						</div>
					</div>

					{d?.rating != null && (
						<div className='flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700'>
							<span className='text-sm text-gray-500 dark:text-gray-400'>
								Рейтинг:
							</span>
							<span className='text-sm font-semibold text-gray-900 dark:text-white'>
								{d.rating.toFixed(1)} ★
							</span>
						</div>
					)}
				</CardContent>
			</Card>

			{error && (
				<p className='text-sm text-red-500 text-center'>{error}</p>
			)}
			{success && (
				<p className='text-sm text-green-600 dark:text-green-400 text-center'>
					Данные успешно сохранены
				</p>
			)}

			<Button
				onClick={handleSave}
				disabled={saving}
				className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'
			>
				{saving ? (
					<Loader2 className='w-4 h-4 mr-2 animate-spin' />
				) : (
					<Save className='w-4 h-4 mr-2' />
				)}
				Сохранить изменения
			</Button>
		</div>
	);
}

export default function Profile() {
	const { profile, loading } = useUser();

	if (loading) {
		return (
			<div className='flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900'>
				<Loader2 className='w-6 h-6 animate-spin text-blue-500' />
			</div>
		);
	}

	const isPsychologist = profile?.role === 'PSYCHOLOGIST';
	const accentColor = isPsychologist
		? 'bg-purple-100 dark:bg-purple-900'
		: 'bg-blue-100 dark:bg-blue-900';
	const accentText = isPsychologist
		? 'text-purple-700 dark:text-purple-400'
		: 'text-blue-700 dark:text-blue-400';
	const badgeColor = isPsychologist
		? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
		: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='max-w-2xl mx-auto'>
				<div className='flex items-center gap-5 mb-8'>
					<div
						className={`w-16 h-16 rounded-full ${accentColor} flex items-center justify-center ${accentText} text-2xl font-bold flex-shrink-0`}
					>
						{profile?.initials ?? '—'}
					</div>
					<div>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
							{profile?.displayName ?? ''}
						</h1>
						<span
							className={`inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}
						>
							{isPsychologist ? 'Психолог' : 'Пользователь'}
						</span>
					</div>
				</div>

				{isPsychologist ? <PsychologistProfile /> : <ClientProfile />}
			</div>
		</div>
	);
}
