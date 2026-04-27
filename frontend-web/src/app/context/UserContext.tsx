import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react';
import { getUser } from '../../api/profile';
import { getPsyshologistProfile } from '../../api/psychologist';

export type UserRole = 'CLIENT' | 'PSYCHOLOGIST';

export interface UserProfile {
	role: UserRole;
	displayName: string;
	initials: string;
	data: any;
}

interface UserContextValue {
	profile: UserProfile | null;
	loading: boolean;
	refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
	profile: null,
	loading: true,
	refreshProfile: async () => {},
});

function decodeToken(token: string): { sub: string; type: UserRole } | null {
	try {
		const base64 = token
			.split('.')[1]
			.replace(/-/g, '+')
			.replace(/_/g, '/');
		return JSON.parse(atob(base64));
	} catch {
		return null;
	}
}

function buildProfile(role: UserRole, data: any): UserProfile {
	if (role === 'PSYCHOLOGIST') {
		const first = data.first_name || '';
		const last = data.last_name || '';
		const displayName = last ? `Др. ${last}` : first || 'Психолог';
		const initials =
			[first[0], last[0]].filter(Boolean).join('').toUpperCase() || 'П';
		return { role, displayName, initials, data };
	} else {
		const name: string = data.name || '';
		const displayName = name || 'Пользователь';
		const initials =
			name
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase() || 'П';
		return { role, displayName, initials, data };
	}
}

export function UserProvider({ children }: { children: ReactNode }) {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = useCallback(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			setLoading(false);
			return;
		}
		const decoded = decodeToken(token);
		if (!decoded) {
			setLoading(false);
			return;
		}
		try {
			if (decoded.type === 'PSYCHOLOGIST') {
				const data = await getPsyshologistProfile(token);
				setProfile(buildProfile('PSYCHOLOGIST', data));
			} else {
				const data = await getUser(token);
				setProfile(buildProfile('CLIENT', data));
			}
		} catch {
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	return (
		<UserContext.Provider
			value={{ profile, loading, refreshProfile: fetchProfile }}
		>
			{children}
		</UserContext.Provider>
	);
}

export const useUser = () => useContext(UserContext);
