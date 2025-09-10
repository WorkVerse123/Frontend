import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		// load mock user from public/mocks
		fetch('/mocks/JSON_DATA/responses/get_user.json')
			.then(r => r.json())
			.then(parsed => {
				if (parsed && parsed.data) setUser(parsed.data);
			}).catch(() => setUser(null));
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
