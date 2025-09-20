import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

		useEffect(() => {
			// load mock user via EndpointResolver
			let mounted = true;
			const ac = new AbortController();
			(async () => {
				try {
					const EndpointResolver = (await import('../services/EndpointResolver')).default;
					const parsed = await EndpointResolver.get('/mocks/JSON_DATA/responses/get_user.json', { signal: ac.signal });
					if (!mounted) return;
					if (parsed && parsed.data) setUser(parsed.data);
					else if (parsed) setUser(parsed);
				} catch (e) {
					if (!mounted) return;
					setUser(null);
				}
			})();
			return () => { mounted = false; ac.abort(); };
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
