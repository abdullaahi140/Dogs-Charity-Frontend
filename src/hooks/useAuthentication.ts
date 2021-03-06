import { useContext } from 'react';
import { useCookies } from 'react-cookie';
import useLogoutCookies from './useLogoutCookies';
import UserContext from '../contexts/user';
import { UserResponse, UserState, Dispatch } from '../react-app-env';

interface AuthContext {
	state: UserState;
	dispatch: Dispatch;
	login: (user: UserResponse) => void;
	logout: () => void
}

/**
 * Custom hook to provide authentication for the application
 * @returns {Object} state alongside functions to login, logout and set a new access token
 */
function useAuthentication(): AuthContext {
	const context = useContext(UserContext);
	const [, setCookie] = useCookies(['user', 'accessToken', 'refreshToken']);

	if (!context) {
		throw new Error('useAthentication must be used within a UserProvider');
	}

	const { state, dispatch } = context;

	const login = ((user: UserResponse) => {
		setCookie('user', user.user, {
			path: '/',
			maxAge: user.refreshToken.expiresIn,
		});
		setCookie('accessToken', user.accessToken, {
			path: '/',
			maxAge: user.accessToken.expiresIn,
		});
		setCookie('refreshToken', user.refreshToken, {
			path: '/',
			maxAge: user.refreshToken.expiresIn,
		});
		dispatch({ type: 'LOGIN', payload: user });
	});
	const { logout } = useLogoutCookies(dispatch);

	return {
		state, dispatch, login, logout,
	};
}

export default useAuthentication;
