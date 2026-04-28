import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2, Save } from 'lucide-react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getWorkingHours, updateWorkingHours } from '../../api/psychologist';

const DAY_ORDER = [
	'MONDAY',
	'TUESDAY',
	'WEDNESDAY',
	'THURSDAY',
	'FRIDAY',
	'SATURDAY',
	'SUNDAY',
] as const;

const DAY_NAMES: Record<string, string> = {
	MONDAY: 'Понедельник',
	TUESDAY: 'Вторник',
	WEDNESDAY: 'Среда',
	THURSDAY: 'Четверг',
	FRIDAY: 'Пятница',
	SATURDAY: 'Суббота',
	SUNDAY: 'Воскресенье',
};

const DAY_SHORT: Record<string, string> = {
	MONDAY: 'ПН',
	TUESDAY: 'ВТ',
	WEDNESDAY: 'СР',
	THURSDAY: 'ЧТ',
	FRIDAY: 'ПТ',
	SATURDAY: 'СБ',
	SUNDAY: 'ВС',
};

const toInput = (t: string | null) => (t ? t.slice(0, 5) : '');

const toApi = (t: string) => (t ? `${t}:00` : null);

const calcHours = (start: string | null, end: string | null): number => {
	if (!start || !end) return 0;
	const [sh, sm] = start.split(':').map(Number);
	const [eh, em] = end.split(':').map(Number);
	const diff = (eh * 60 + em - sh * 60 - sm) / 60;
	return diff > 0 ? diff : 0;
};

interface DaySchedule {
	day_of_week: string;
	start_time: string | null;
	end_time: string | null;
	is_active: boolean;
}

export default function WorkingHours() {
	const token = localStorage.getItem('token') ?? '';
	const [schedule, setSchedule] = useState<DaySchedule[]>([]);
	const [original, setOriginal] = useState<DaySchedule[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [saveError, setSaveError] = useState('');
	const [saved, setSaved] = useState(false);

	const fetchSchedule = async () => {
		setLoading(true);
		setError('');
		try {
			const data: DaySchedule[] = await getWorkingHours(token);
			const sorted = DAY_ORDER.map(
				(d) =>
					data.find((x) => x.day_of_week === d) ?? {
						day_of_week: d,
						start_time: null,
						end_time: null,
						is_active: false,
					},
			);
			setSchedule(sorted);
			setOriginal(sorted);
		} catch (e: any) {
			setError(e.message || 'Ошибка при загрузке расписания');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSchedule();
	}, []);

	const updateDay = (index: number, patch: Partial<DaySchedule>) => {
		setSaved(false);
		setSaveError('');
		setSchedule((prev) =>
			prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
		);
	};

	const handleSave = async () => {
		setSaveError('');
		setSaved(false);

		const isFullHour = (t: string | null) => {
			if (!t) return true;
			const [, mm] = toInput(t).split(':');
			return mm === '00';
		};

		const invalidDay = schedule.find(
			(d) => !isFullHour(d.start_time) || !isFullHour(d.end_time),
		);
		if (invalidDay) {
			setSaveError(
				`${DAY_NAMES[invalidDay.day_of_week]}: время должно быть целым числом часов (например, 09:00, 18:00)`,
			);
			return;
		}

		setSaving(true);
		try {
			const payload = schedule
				.filter((d) => d.start_time !== null && d.end_time !== null)
				.map((d) => ({
					day_of_week: d.day_of_week,
					start_time: toApi(toInput(d.start_time)),
					end_time: toApi(toInput(d.end_time)),
					is_active: d.is_active,
				}));
			const updated: DaySchedule[] = await updateWorkingHours(
				token,
				payload,
			);
			const sorted = DAY_ORDER.map(
				(d) =>
					updated.find((x) => x.day_of_week === d) ??
					schedule.find((x) => x.day_of_week === d)!,
			);
			setSchedule(sorted);
			setOriginal(sorted);
			setSaved(true);
		} catch (e: any) {
			setSaveError(e.message || 'Ошибка при сохранении');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setSchedule(original);
		setSaveError('');
		setSaved(false);
	};

	const activeDays = schedule.filter((d) => d.is_active).length;
	const totalHours = schedule
		.filter((d) => d.is_active)
		.reduce((sum, d) => sum + calcHours(d.start_time, d.end_time), 0);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loader2 className='w-8 h-8 animate-spin text-blue-500' />
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-8 text-center'>
				<p className='text-red-500 mb-4'>{error}</p>
				<Button variant='outline' onClick={fetchSchedule}>
					Повторить
				</Button>
			</div>
		);
	}

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
					Рабочее расписание
				</h1>
				<p className='text-gray-500 dark:text-gray-400 mt-1'>
					Настройте дни и часы работы
				</p>
			</div>

			<div className='grid grid-cols-2 gap-4 mb-8'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-5 flex items-center gap-4'>
						<div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center'>
							<CheckCircle2 className='w-5 h-5 text-blue-600 dark:text-blue-400' />
						</div>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Рабочих дней
							</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-white'>
								{activeDays}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-5 flex items-center gap-4'>
						<div className='w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center'>
							<Clock className='w-5 h-5 text-green-600 dark:text-green-400' />
						</div>
						<div>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Часов в неделю
							</p>
							<p className='text-2xl font-bold text-gray-900 dark:text-white'>
								{totalHours}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className='mb-8 dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader>
					<CardTitle className='dark:text-white'>
						Недельный обзор
					</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						Быстрый просмотр рабочих дней
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-7 gap-2'>
						{schedule.map((day) => (
							<div
								key={day.day_of_week}
								className={`p-3 rounded-lg border-2 text-center transition-all ${
									day.is_active
										? 'bg-blue-50 border-blue-300 dark:bg-gray-700 dark:border-blue-500'
										: 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'
								}`}
							>
								<div className='font-semibold text-sm text-gray-900 dark:text-white mb-2'>
									{DAY_SHORT[day.day_of_week]}
								</div>
								{day.is_active ? (
									<>
										<CheckCircle2 className='w-5 h-5 text-green-600 mx-auto mb-1' />
										<div className='text-xs text-gray-600 dark:text-gray-300'>
											{toInput(day.start_time) || '—'}
										</div>
										<div className='text-xs text-gray-600 dark:text-gray-300'>
											{toInput(day.end_time) || '—'}
										</div>
										{day.start_time && day.end_time && (
											<div className='text-xs font-medium text-blue-600 dark:text-blue-400 mt-1'>
												{calcHours(
													day.start_time,
													day.end_time,
												)}
												ч
											</div>
										)}
									</>
								) : (
									<>
										<XCircle className='w-5 h-5 text-gray-400 mx-auto mb-1' />
										<div className='text-xs text-gray-400'>
											Выходной
										</div>
									</>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card className='dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader>
					<CardTitle className='dark:text-white'>
						Детальное расписание
					</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						Настройте время работы для каждого дня недели
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{schedule.map((day, index) => (
							<div
								key={day.day_of_week}
								className={`p-5 rounded-lg border transition-all ${
									day.is_active
										? 'border-blue-200 bg-white dark:bg-gray-700 dark:border-blue-800'
										: 'border-gray-200 bg-gray-50 dark:bg-gray-700/40 dark:border-gray-600'
								}`}
							>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<h3 className='font-semibold text-gray-900 dark:text-gray-100'>
											{DAY_NAMES[day.day_of_week]}
										</h3>
										{day.is_active && (
											<Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
												Рабочий день
											</Badge>
										)}
									</div>
									<div className='flex items-center gap-3'>
										<Label
											htmlFor={`switch-${day.day_of_week}`}
											className='text-sm text-gray-600 dark:text-gray-300 cursor-pointer'
										>
											Рабочий день
										</Label>
										<Switch
											id={`switch-${day.day_of_week}`}
											checked={day.is_active}
											onCheckedChange={(v) =>
												updateDay(index, {
													is_active: v,
												})
											}
										/>
									</div>
								</div>

								{day.is_active && (
									<div className='mt-4 flex flex-wrap gap-6'>
										<div className='space-y-1'>
											<Label className='text-sm text-gray-600 dark:text-gray-400'>
												Начало работы
											</Label>
											<div className='flex items-center gap-2'>
												<Clock className='w-4 h-4 text-gray-400' />
												<Input
													type='time'
													step={3600}
													value={toInput(
														day.start_time,
													)}
													onChange={(e) =>
														updateDay(index, {
															start_time: e.target
																.value
																? `${e.target.value}:00`
																: null,
														})
													}
													className='w-36 cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-white'
												/>
											</div>
										</div>
										<div className='space-y-1'>
											<Label className='text-sm text-gray-600 dark:text-gray-400'>
												Окончание работы
											</Label>
											<div className='flex items-center gap-2'>
												<Clock className='w-4 h-4 text-gray-400' />
												<Input
													type='time'
													step={3600}
													value={toInput(
														day.end_time,
													)}
													onChange={(e) =>
														updateDay(index, {
															end_time: e.target
																.value
																? `${e.target.value}:00`
																: null,
														})
													}
													className='w-36 cursor-pointer dark:bg-gray-800 dark:border-gray-600 dark:text-white'
												/>
											</div>
										</div>
										{day.start_time && day.end_time && (
											<div className='flex items-end'>
												<span className='text-sm text-gray-500 dark:text-gray-400'>
													{calcHours(
														day.start_time,
														day.end_time,
													)}{' '}
													ч рабочих
												</span>
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>

					<div className='mt-6 pt-6 border-t dark:border-gray-700 flex items-center justify-between'>
						<div>
							{saveError && (
								<p className='text-sm text-red-500'>
									{saveError}
								</p>
							)}
							{saved && (
								<p className='text-sm text-green-600 dark:text-green-400'>
									Расписание сохранено
								</p>
							)}
						</div>
						<div className='flex gap-3'>
							<Button
								variant='outline'
								onClick={handleCancel}
								disabled={saving}
								className='dark:border-gray-600 dark:text-gray-300'
							>
								Отменить
							</Button>
							<Button
								onClick={handleSave}
								disabled={saving}
								className='bg-blue-600 hover:bg-blue-700 dark:text-white'
							>
								{saving ? (
									<Loader2 className='w-4 h-4 mr-2 animate-spin' />
								) : (
									<Save className='w-4 h-4 mr-2' />
								)}
								Сохранить расписание
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
