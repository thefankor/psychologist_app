import { useEffect, useState } from 'react';
import {
	Clock,
	CheckCircle2,
	XCircle,
	Loader2,
	Save,
	Zap,
	Trash2,
	Plus,
	CalendarDays,
} from 'lucide-react';
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
import {
	getWorkingHours,
	updateWorkingHours,
	getMySlots,
	generateSlots,
	createManualSlot,
	deleteSlot,
	cancelSlot,
} from '../../api/psychologist';

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

interface Slot {
	id: string;
	starts_at: string;
	ends_at: string;
	status: 'FREE' | 'BOOKED' | 'CANCELLED';
	source: 'TEMPLATE' | 'MANUAL';
}

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

	const [slots, setSlots] = useState<Slot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [slotFromDate, setSlotFromDate] = useState(() =>
		new Date().toISOString().slice(0, 10),
	);
	const [slotToDate, setSlotToDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() + 30);
		return d.toISOString().slice(0, 10);
	});
	const [generating, setGenerating] = useState(false);
	const [generateMsg, setGenerateMsg] = useState('');
	const [manualDate, setManualDate] = useState('');
	const [manualTime, setManualTime] = useState('');
	const [addingManual, setAddingManual] = useState(false);
	const [slotError, setSlotError] = useState('');

	const fetchSlots = async () => {
		setSlotsLoading(true);
		setSlotError('');
		try {
			const from = new Date(slotFromDate + 'T00:00:00').toISOString();
			const to = new Date(slotToDate + 'T23:59:59').toISOString();
			const data: Slot[] = await getMySlots(token, from, to);
			setSlots(
				data.sort(
					(a, b) =>
						new Date(a.starts_at).getTime() -
						new Date(b.starts_at).getTime(),
				),
			);
		} catch (e: any) {
			setSlotError(e.message || 'Ошибка загрузки слотов');
		} finally {
			setSlotsLoading(false);
		}
	};

	const handleGenerate = async () => {
		setGenerating(true);
		setGenerateMsg('');
		setSlotError('');
		try {
			const res = await generateSlots(token, slotFromDate, slotToDate);
			setGenerateMsg(
				`Создано: ${res.created}, пропущено: ${res.skipped}`,
			);
			await fetchSlots();
		} catch (e: any) {
			setSlotError(e.message || 'Ошибка генерации');
		} finally {
			setGenerating(false);
		}
	};

	const handleAddManual = async () => {
		if (!manualDate || !manualTime) return;
		setAddingManual(true);
		setSlotError('');
		try {
			const d = new Date(`${manualDate}T${manualTime}:00`);
			await createManualSlot(token, d.toISOString());
			setManualDate('');
			setManualTime('');
			await fetchSlots();
		} catch (e: any) {
			setSlotError(e.message || 'Ошибка создания слота');
		} finally {
			setAddingManual(false);
		}
	};

	const handleDeleteSlot = async (slotId: string) => {
		try {
			await deleteSlot(token, slotId);
			setSlots((prev) => prev.filter((s) => s.id !== slotId));
		} catch (e: any) {
			setSlotError(e.message || 'Ошибка удаления');
		}
	};

	const handleCancelSlot = async (slotId: string) => {
		try {
			await cancelSlot(token, slotId);
			setSlots((prev) =>
				prev.map((s) =>
					s.id === slotId ? { ...s, status: 'CANCELLED' } : s,
				),
			);
		} catch (e: any) {
			setSlotError(e.message || 'Ошибка отмены');
		}
	};

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
		fetchSlots();
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
			const resp = await updateWorkingHours(token, payload);
			const updatedList: DaySchedule[] = Array.isArray(resp)
				? resp
				: (resp.ranges ?? []);
			const sorted = DAY_ORDER.map(
				(d) =>
					updatedList.find((x: DaySchedule) => x.day_of_week === d) ??
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

			<Card className='mt-8 dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader>
					<CardTitle className='dark:text-white flex items-center gap-2'>
						<CalendarDays className='w-5 h-5' />
						Слоты для записи
					</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						Управление временными слотами для записи клиентов
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='flex flex-wrap gap-4 items-end p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40'>
						<div className='space-y-1'>
							<Label className='text-sm dark:text-gray-300'>
								С
							</Label>
							<input
								type='date'
								value={slotFromDate}
								onChange={(e) =>
									setSlotFromDate(e.target.value)
								}
								className='px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<div className='space-y-1'>
							<Label className='text-sm dark:text-gray-300'>
								По
							</Label>
							<input
								type='date'
								value={slotToDate}
								min={slotFromDate}
								onChange={(e) => setSlotToDate(e.target.value)}
								className='px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<Button
							onClick={() => fetchSlots()}
							variant='outline'
							className='dark:border-gray-600 dark:text-gray-300'
						>
							Показать
						</Button>
						<Button
							onClick={handleGenerate}
							disabled={generating}
							className='bg-blue-600 hover:bg-blue-700 dark:text-white'
						>
							{generating ? (
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							) : (
								<Zap className='w-4 h-4 mr-2' />
							)}
							Сгенерировать из шаблона
						</Button>
						{generateMsg && (
							<span className='text-sm text-green-600 dark:text-green-400'>
								{generateMsg}
							</span>
						)}
					</div>

					<div className='flex flex-wrap gap-4 items-end p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40'>
						<div className='space-y-1'>
							<Label className='text-sm dark:text-gray-300'>
								Дата
							</Label>
							<input
								type='date'
								value={manualDate}
								min={new Date().toISOString().slice(0, 10)}
								onChange={(e) => setManualDate(e.target.value)}
								className='px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<div className='space-y-1'>
							<Label className='text-sm dark:text-gray-300'>
								Время
							</Label>
							<input
								type='time'
								value={manualTime}
								onChange={(e) => setManualTime(e.target.value)}
								className='px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<Button
							onClick={handleAddManual}
							disabled={
								addingManual || !manualDate || !manualTime
							}
							className='bg-purple-600 hover:bg-purple-700 dark:text-white'
						>
							{addingManual ? (
								<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							) : (
								<Plus className='w-4 h-4 mr-2' />
							)}
							Добавить вручную
						</Button>
					</div>

					{slotError && (
						<p className='text-sm text-red-500'>{slotError}</p>
					)}

					{slotsLoading ? (
						<div className='flex justify-center py-8'>
							<Loader2 className='w-6 h-6 animate-spin text-blue-500' />
						</div>
					) : slots.length === 0 ? (
						<p className='text-sm text-center text-gray-500 dark:text-gray-400 py-8'>
							Нет слотов в выбранном периоде
						</p>
					) : (
						<div className='space-y-2'>
							{slots.map((slot) => {
								const start = new Date(slot.starts_at);
								const end = new Date(slot.ends_at);
								const statusColor =
									slot.status === 'FREE'
										? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
										: slot.status === 'BOOKED'
											? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
											: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
								const statusLabel =
									slot.status === 'FREE'
										? 'Свободен'
										: slot.status === 'BOOKED'
											? 'Занят'
											: 'Отменён';
								return (
									<div
										key={slot.id}
										className='flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
									>
										<div className='flex items-center gap-3'>
											<div>
												<p className='text-sm font-medium text-gray-900 dark:text-white'>
													{start.toLocaleDateString(
														'ru-RU',
														{
															day: 'numeric',
															month: 'long',
															weekday: 'short',
														},
													)}
												</p>
												<p className='text-xs text-gray-500 dark:text-gray-400'>
													{start.toLocaleTimeString(
														'ru-RU',
														{
															hour: '2-digit',
															minute: '2-digit',
														},
													)}
													{' — '}
													{end.toLocaleTimeString(
														'ru-RU',
														{
															hour: '2-digit',
															minute: '2-digit',
														},
													)}
													{slot.source ===
														'MANUAL' && (
														<span className='ml-2 text-purple-500'>
															вручную
														</span>
													)}
												</p>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											<Badge className={statusColor}>
												{statusLabel}
											</Badge>
											{slot.status === 'FREE' && (
												<button
													onClick={() =>
														handleDeleteSlot(
															slot.id,
														)
													}
													className='cursor-pointer p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors'
													title='Удалить'
												>
													<Trash2 className='w-4 h-4' />
												</button>
											)}
											{slot.status === 'BOOKED' && (
												<button
													onClick={() =>
														handleCancelSlot(
															slot.id,
														)
													}
													className='cursor-pointer px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-colors'
												>
													Отменить
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
