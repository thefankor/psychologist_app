import { useEffect, useState } from 'react';
import { Heart, Loader2, CalendarPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import {
	getAllFavorites,
	deleteFavoritePsychologist,
	getFreeSlots,
	bookSlot,
} from '../../api/psychologist';

const METHOD_LABELS: Record<string, string> = {
	GESTALT: 'Гештальт',
	PSYHODRAM: 'Психодрама',
	PSYHOANALISE: 'Психоанализ',
	EXISTENAL: 'Экзистенциальная',
	SYSTEM: 'Системная',
};

const getInitials = (fullName: string) =>
	fullName
		.split(' ')
		.map((n) => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase() || '?';

const fixUrl = (url: string | null) =>
	url ? url.replace('http://0.0.0.0:', 'http://localhost:') : null;

function ConfirmRemoveDialog({
	open,
	name,
	onConfirm,
	onCancel,
}: {
	open: boolean;
	name: string;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700 max-w-sm'>
				<DialogHeader>
					<DialogTitle className='dark:text-white'>
						Убрать из избранного?
					</DialogTitle>
				</DialogHeader>
				<p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
					{name} будет удалён из вашего списка избранных психологов.
				</p>
				<div className='flex gap-3 mt-4'>
					<Button
						variant='outline'
						className='flex-1 dark:border-gray-600 dark:text-gray-300'
						onClick={onCancel}
					>
						Отмена
					</Button>
					<Button
						className='flex-1 bg-red-600 hover:bg-red-700 dark:text-white'
						onClick={onConfirm}
					>
						Удалить
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

interface FreeSlot {
	id: string;
	starts_at: string;
	ends_at: string;
}

function BookingDialog({
	psychologist,
	onBooked,
}: {
	psychologist: any;
	onBooked: () => void;
}) {
	const token = localStorage.getItem('token') ?? '';
	const [open, setOpen] = useState(false);
	const today = new Date().toISOString().slice(0, 10);
	const weekLater = new Date(Date.now() + 7 * 86400_000)
		.toISOString()
		.slice(0, 10);
	const [fromDate, setFromDate] = useState(today);
	const [toDate, setToDate] = useState(weekLater);
	const [slots, setSlots] = useState<FreeSlot[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [slotsError, setSlotsError] = useState('');
	const [selectedSlot, setSelectedSlot] = useState<string>('');
	const [booking, setBooking] = useState(false);
	const [error, setError] = useState('');

	const fetchSlots = async () => {
		setLoadingSlots(true);
		setSlotsError('');
		setSelectedSlot('');
		try {
			const fromDt = `${fromDate}T00:00:00Z`;
			const toDt = `${toDate}T23:59:59Z`;
			const data: FreeSlot[] = await getFreeSlots(
				token,
				psychologist.id,
				fromDt,
				toDt,
			);
			setSlots(data);
			if (data.length === 0)
				setSlotsError('Нет доступных слотов в этом периоде');
		} catch (e: any) {
			setSlotsError(e.message || 'Ошибка при загрузке слотов');
		} finally {
			setLoadingSlots(false);
		}
	};

	const handleOpen = (v: boolean) => {
		setOpen(v);
		if (v) {
			setSlots([]);
			setSlotsError('');
			setSelectedSlot('');
			setError('');
			fetchSlots();
		}
	};

	const handleBook = async () => {
		if (!selectedSlot) {
			setError('Выберите время');
			return;
		}
		setBooking(true);
		setError('');
		try {
			await bookSlot(token, selectedSlot);
			setOpen(false);
			onBooked();
		} catch (e: any) {
			setError(e.message || 'Ошибка при записи');
		} finally {
			setBooking(false);
		}
	};

	const formatSlot = (s: FreeSlot) => {
		const d = new Date(s.starts_at);
		return d.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button className='flex-1 bg-purple-600 hover:bg-purple-700 dark:text-white'>
					<CalendarPlus className='w-4 h-4 mr-2' />
					Записаться
				</Button>
			</DialogTrigger>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700 max-w-md'>
				<DialogHeader>
					<DialogTitle className='dark:text-white'>
						Запись к {psychologist.full_name}
					</DialogTitle>
				</DialogHeader>
				<div className='space-y-4 mt-2'>
					<div className='flex gap-2 items-end'>
						<div className='flex-1 space-y-1'>
							<Label className='dark:text-gray-200 text-xs'>
								С
							</Label>
							<input
								type='date'
								value={fromDate}
								min={today}
								onChange={(e) => setFromDate(e.target.value)}
								className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<div className='flex-1 space-y-1'>
							<Label className='dark:text-gray-200 text-xs'>
								По
							</Label>
							<input
								type='date'
								value={toDate}
								min={fromDate}
								onChange={(e) => setToDate(e.target.value)}
								className='w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer'
							/>
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={() => fetchSlots()}
							disabled={loadingSlots}
							className='dark:border-gray-600 dark:text-gray-300 self-end'
						>
							{loadingSlots ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								'Найти'
							)}
						</Button>
					</div>

					{slotsError && !loadingSlots && (
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							{slotsError}
						</p>
					)}

					{loadingSlots && (
						<div className='flex justify-center py-4'>
							<Loader2 className='w-6 h-6 animate-spin text-purple-500' />
						</div>
					)}

					{!loadingSlots && slots.length > 0 && (
						<div className='space-y-1 max-h-52 overflow-y-auto pr-1'>
							{slots.map((s) => (
								<button
									key={s.id}
									onClick={() => setSelectedSlot(s.id)}
									className={`cursor-pointer w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
										selectedSlot === s.id
											? 'bg-purple-600 text-white border-purple-600'
											: 'dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:border-purple-400 dark:hover:border-purple-500'
									}`}
								>
									{formatSlot(s)}
								</button>
							))}
						</div>
					)}

					{error && <p className='text-sm text-red-500'>{error}</p>}

					<Button
						onClick={handleBook}
						disabled={booking || !selectedSlot}
						className='w-full bg-purple-600 hover:bg-purple-700 dark:text-white'
					>
						{booking && (
							<Loader2 className='w-4 h-4 mr-2 animate-spin' />
						)}
						Записаться
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default function Favorites() {
	const token = localStorage.getItem('token') ?? '';
	const [favorites, setFavorites] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [removingId, setRemovingId] = useState<number | null>(null);
	const [confirmRemove, setConfirmRemove] = useState<{
		id: number;
		name: string;
	} | null>(null);
	const [bookedId, setBookedId] = useState<number | null>(null);

	const fetchFavorites = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await getAllFavorites(token);
			setFavorites(data);
		} catch (e: any) {
			setError(e.message || 'Ошибка при загрузке избранного');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFavorites();
	}, []);

	const handleRemove = async (id: number) => {
		setRemovingId(id);
		try {
			await deleteFavoritePsychologist(token, id);
			setFavorites((prev) => prev.filter((p) => p.id !== id));
		} catch {
		} finally {
			setRemovingId(null);
			setConfirmRemove(null);
		}
	};

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
					Избранное
				</h1>
				<p className='text-gray-500 dark:text-gray-400 mt-1'>
					Психологи, которых вы добавили в избранное
				</p>
			</div>

			{loading ? (
				<div className='flex items-center justify-center py-24'>
					<Loader2 className='w-8 h-8 animate-spin text-purple-500' />
				</div>
			) : error ? (
				<div className='text-center py-24'>
					<p className='text-red-500'>{error}</p>
					<Button
						variant='outline'
						className='mt-4 dark:border-gray-600 dark:text-gray-300'
						onClick={fetchFavorites}
					>
						Повторить
					</Button>
				</div>
			) : favorites.length === 0 ? (
				<div className='text-center py-24'>
					<Heart className='w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4' />
					<p className='text-gray-500 dark:text-gray-400'>
						Вы ещё не добавили ни одного психолога в избранное
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{favorites.map((p) => (
						<Card
							key={p.id}
							className='hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700'
						>
							<CardContent className='p-6'>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex items-center gap-3'>
										<div className='w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-400 font-semibold text-lg flex-shrink-0 overflow-hidden'>
											{fixUrl(p.avatar) ? (
												<img
													src={fixUrl(p.avatar)!}
													alt=''
													className='w-full h-full object-cover'
												/>
											) : (
												getInitials(p.full_name)
											)}
										</div>
										<div className='min-w-0'>
											<h3 className='font-semibold text-gray-900 dark:text-white truncate'>
												{p.full_name}
											</h3>
											<p className='text-sm text-gray-500 dark:text-gray-400'>
												Психолог
											</p>
										</div>
									</div>
									<button
										onClick={() =>
											setConfirmRemove({
												id: p.id,
												name: p.full_name,
											})
										}
										disabled={removingId === p.id}
										className='cursor-pointer p-1.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex-shrink-0'
										title='Убрать из избранного'
									>
										<Heart className='w-5 h-5 fill-red-500 text-red-500' />
									</button>
								</div>

								{p.methods && p.methods.length > 0 && (
									<div className='flex flex-wrap gap-1 mb-4'>
										{p.methods.map((m: string) => (
											<Badge
												key={m}
												className='bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs'
											>
												{METHOD_LABELS[m] ?? m}
											</Badge>
										))}
									</div>
								)}

								<div className='flex gap-2 mt-4'>
									{bookedId === p.id ? (
										<div className='flex-1 text-center py-2 text-sm text-green-600 dark:text-green-400 font-medium'>
											Запись создана ✓
										</div>
									) : (
										<BookingDialog
											psychologist={p}
											onBooked={() => setBookedId(p.id)}
										/>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<ConfirmRemoveDialog
				open={confirmRemove !== null}
				name={confirmRemove?.name ?? ''}
				onConfirm={() =>
					confirmRemove && handleRemove(confirmRemove.id)
				}
				onCancel={() => setConfirmRemove(null)}
			/>
		</div>
	);
}
