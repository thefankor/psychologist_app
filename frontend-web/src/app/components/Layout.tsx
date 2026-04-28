import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
	LayoutDashboard,
	Users,
	Calendar,
	Clock,
	MessageSquare,
	Wallet,
	LogOut,
	Moon,
	Sun,
	Heart,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { UserProvider, useUser } from '../context/UserContext';

type NavItem = {
	to: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	exact?: boolean;
};

const NAV_ITEMS_PSYCHOLOGIST: NavItem[] = [
	{ to: '/', icon: LayoutDashboard, label: 'Дашборд', exact: true },
	{ to: '/clients', icon: Users, label: 'Клиенты' },
	{ to: '/sessions', icon: Calendar, label: 'Расписание' },
	{ to: '/chats', icon: MessageSquare, label: 'Сообщения' },
	{ to: '/working-hours', icon: Clock, label: 'Рабочие часы' },
];

const NAV_ITEMS_CLIENT: NavItem[] = [
	{ to: '/psychologists', icon: Users, label: 'Психологи' },
	{ to: '/favorites', icon: Heart, label: 'Избранное' },
	{ to: '/sessions', icon: Calendar, label: 'Расписание' },
	{ to: '/chats', icon: MessageSquare, label: 'Сообщения' },
];

function ConfirmLogoutDialog({
	open,
	onConfirm,
	onCancel,
}: {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
			<DialogContent className='dark:bg-gray-800 dark:border-gray-700 max-w-sm'>
				<DialogHeader>
					<DialogTitle className='dark:text-white'>
						Выход из аккаунта
					</DialogTitle>
				</DialogHeader>
				<p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
					Вы уверены, что хотите выйти из аккаунта?
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
						Выйти
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function LayoutInner() {
	const location = useLocation();
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);
	const { profile } = useUser();

	useEffect(() => {
		setMounted(true);
	}, []);

	const isActive = (path: string, exact?: boolean) =>
		exact ? location.pathname === path : location.pathname.startsWith(path);

	const navClass = (active: boolean) =>
		`w-full justify-start cursor-pointer ${
			active
				? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
				: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
		}`;

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/auth');
	};

	const isPsychologist = profile?.role === 'PSYCHOLOGIST';
	const roleLabel = isPsychologist ? 'Психолог' : 'Пользователь';
	const NAV_ITEMS = isPsychologist
		? NAV_ITEMS_PSYCHOLOGIST
		: NAV_ITEMS_CLIENT;

	return (
		<div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
			<aside className='w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col'>
				<div className='p-6 border-b border-gray-200 dark:border-gray-700'>
					<h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
						PsyConsult
					</h1>
					<h5 className='text-sm text-gray-500 dark:text-white mt-1'>
						Рабочее пространство
					</h5>
				</div>

				<nav className='flex-1 p-4 space-y-1'>
					{NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
						<Link key={to} to={to}>
							<Button
								variant='ghost'
								className={navClass(isActive(to, exact))}
							>
								<Icon className='w-5 h-5 mr-3' />
								{label}
							</Button>
						</Link>
					))}
				</nav>

				<div className='p-4 border-t border-gray-200 dark:border-gray-700'>
					<Link to='/profile'>
						<div
							className={`flex items-center mb-3 p-2 rounded-lg cursor-pointer transition-colors ${
								isActive('/profile')
									? isPsychologist
										? 'bg-purple-50 dark:bg-purple-900/30'
										: 'bg-blue-50 dark:bg-blue-900/30'
									: 'hover:bg-gray-100 dark:hover:bg-gray-700'
							}`}
						>
							<div
								className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-semibold flex-shrink-0 ${
									isPsychologist
										? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400'
										: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400'
								}`}
							>
								{profile?.avatar ? (
									<img
										src={profile.avatar}
										alt='avatar'
										className='w-full h-full object-cover'
									/>
								) : (
									(profile?.initials ?? '—')
								)}
							</div>
							<div className='ml-3 min-w-0'>
								<p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
									{profile?.displayName ?? '...'}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-400'>
									{roleLabel}
								</p>
							</div>
						</div>
					</Link>

					{mounted && (
						<Button
							variant='ghost'
							className='w-full justify-start text-gray-700 dark:text-gray-300 mb-2 cursor-pointer hover:dark:bg-blue-900/30'
							onClick={() =>
								setTheme(theme === 'dark' ? 'light' : 'dark')
							}
						>
							{theme === 'dark' ? (
								<>
									<Sun className='w-5 h-5 mr-3' />
									Светлая тема
								</>
							) : (
								<>
									<Moon className='w-5 h-5 mr-3' />
									Тёмная тема
								</>
							)}
						</Button>
					)}

					<Button
						variant='ghost'
						className='w-full justify-start text-gray-700 dark:text-gray-300 cursor-pointer hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
						onClick={() => setOpen(true)}
					>
						<LogOut className='w-5 h-5 mr-3' />
						Выход
					</Button>
				</div>

				<ConfirmLogoutDialog
					open={open}
					onConfirm={handleLogout}
					onCancel={() => setOpen(false)}
				/>
			</aside>

			<main className='flex-1 overflow-auto'>
				<Outlet />
			</main>
		</div>
	);
}

export default function Layout() {
	return (
		<UserProvider>
			<LayoutInner />
		</UserProvider>
	);
}
