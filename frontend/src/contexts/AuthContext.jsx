import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

		useEffect(() => {
			// load mock user from public/mocks via MocksService
			import('../services/MocksService').then((M) => {
				M.fetchMock('/mocks/JSON_DATA/responses/get_user.json')
					.then(parsed => {
						if (parsed && parsed.data) setUser(parsed.data);
						else if (parsed) setUser(parsed);
					})
					.catch(() => setUser(null));
			});
		}, []);

	return (
		<AuthContext.Provider value={{ user }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext) || { user: null };
}

export default AuthContext;
