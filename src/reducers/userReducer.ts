import { Action, UserState } from '../react-app-env';

/**
 * Reducer for manipulating user state in the application
 * @param {Object} state - global application state
 * @param {Object} action - action from reducer with type and payload
 */
function userReducer(state: UserState, action: Action): UserState {
	switch (action.type) {
		// Adds the authenticated user to state which updates the user context
		case 'LOGIN': {
			return {
				user: action.payload.user,
				loggedIn: true,
				accessToken: action.payload.accessToken,
				refreshToken: action.payload.refreshToken,
			};
		}

		// Logs the user out and resets the state which also resets the user context
		case 'LOGOUT': {
			return {
				user: null,
				loggedIn: false,
				accessToken: null,
				refreshToken: null,
			};
		}

		// Set a new access token
		case 'REFRESH_ACCESS_TOKEN': {
			return { ...state, accessToken: action.payload.accessToken };
		}

		default: {
			const invalidAction: { type: never } = action;
			throw new Error(`Unsupported action type: ${invalidAction.type}`);
		}
	}
}

export default userReducer;
