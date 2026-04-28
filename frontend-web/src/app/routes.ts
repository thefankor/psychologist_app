import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import ClientDetails from './components/ClientDetails';
import Sessions from './components/Sessions';
import WorkingHours from './components/WorkingHours';
import Chats from './components/Chats';
import NotFound from './components/NotFound';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Psychologists from './components/Psychologists';
import Favorites from './components/Favorites';
import { PsychologistRoute, ClientRoute } from './components/RoleRoute';

export const router = createBrowserRouter([
	{
		path: '/',
		Component: ProtectedRoute,
		children: [
			{
				Component: Layout,
				children: [
					{
						Component: PsychologistRoute,
						children: [
							{ index: true, Component: Dashboard },
							{ path: 'clients', Component: Clients },
							{ path: 'clients/:id', Component: ClientDetails },
							{ path: 'working-hours', Component: WorkingHours },
						],
					},
					{
						Component: ClientRoute,
						children: [
							{ path: 'psychologists', Component: Psychologists },
							{ path: 'favorites', Component: Favorites },
						],
					},
					{ path: 'sessions', Component: Sessions },
					{ path: 'chats', Component: Chats },
					{ path: 'profile', Component: Profile },
					{ path: '*', Component: NotFound },
				],
			},
		],
	},
	{
		path: '/auth',
		Component: Auth,
	},
]);
