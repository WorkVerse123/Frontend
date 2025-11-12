import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie } from '../services/AuthCookie';
import { ca } from 'date-fns/locale';

const AuthContext = createContext(null);

// Safe JWT payload parser (browser). Returns parsed payload object or null.
function parseJwtPayload(token) {
	if (!token || typeof token !== 'string') return null;
	try {
		const parts = token.split('.');
		if (parts.length < 2) return null;
		const payload = parts[1];
		// atob -> percent-encoding -> decodeURIComponent to support unicode
		const json = decodeURIComponent(atob(payload).split('').map(function(c) {
			return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
		}).join(''));
		return JSON.parse(json);
	} catch (e) {
		try {
			// fallback: try simple base64 decode
			const raw = atob(token.split('.')[1] || '');
			return JSON.parse(raw);
		} catch (err) {
			return null;
		}
	}
}

function toPositiveIntOrNull(v) {
	if (v === null || v === undefined) return null;
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeUser(candidate) {
	if (!candidate || typeof candidate !== 'object') return candidate;
	// accept various key casings
	const EmployeeRaw = candidate.EmployeeId ?? candidate.employeeId ?? candidate.EmployeeID ?? candidate.employee_id ?? null;
	const EmployerRaw = candidate.EmployerId ?? candidate.employerId ?? candidate.EmployerID ?? candidate.employer_id ?? null;
	const rawRoleId = candidate.RoleId ?? candidate.roleId ?? candidate.role ?? candidate.Role ?? candidate.role_id ?? null;

	const employeeId = toPositiveIntOrNull(EmployeeRaw);
	const employerId = toPositiveIntOrNull(EmployerRaw);
	const roleId = rawRoleId != null ? Number(rawRoleId) : null;

	const mapRole = (id) => {
		switch (id) {
			case 1: return 'admin';
			case 2: return 'staff';
			case 3: return 'employer';
			case 4: return 'employee';
			case 8: return 'finance';
			default: return 'guest';
		}
	};

	let finalRole = 'guest';
	let finalRoleId = roleId;
	if (employeeId !== null) { finalRole = 'employee'; finalRoleId = finalRoleId || 4; }
	else if (employerId !== null) { finalRole = 'employer'; finalRoleId = finalRoleId || 3; }
	else finalRole = mapRole(roleId);

	const hasProfile = (finalRole === 'employee' && employeeId !== null) || (finalRole === 'employer' && employerId !== null);
	const profileType = hasProfile ? finalRole : null;
	const profileId = profileType === 'employee' ? employeeId : (profileType === 'employer' ? employerId : null);

	return { ...candidate, employeeId, employerId, roleId: finalRoleId, role: finalRole, hasProfile, profileType, profileId };
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		// initialize auth from cookies (login flow sets cookie 'token' and optionally 'user')
		let mounted = true;
		try {
			const token = getCookie('token');
			const userCookie = getCookie('user');

			// If a user cookie exists, only trust it when a token cookie is present too.
			// This prevents stale/partial cookie states where user data exists but no auth token.
			if (userCookie) {
				if (!token) {
					// don't set user from cookie when token missing - treat as unauthenticated
					if (mounted) setUser(null);
				} else {
					try {
						const parsed = JSON.parse(userCookie);
						// ensure cookie-provided user is normalized (numbers, role mapping)
						const normalized = normalizeUser(parsed) || parsed;
						if (mounted) setUser(normalized);
						return;
					} catch (e) {
						// ignore parse error and continue to token parsing
					}
				}
			}

			if (token) {
				const payload = parseJwtPayload(token);
				// backend may put user info under payload.user or payload.data or directly in payload
				const rawCandidate = (payload && (payload.user || payload.data || payload)) || null;
				const candidate = normalizeUser(rawCandidate);
				if (candidate && mounted) setUser(candidate);
				else if (mounted) setUser(null);
				return;
			}

			if (mounted) setUser(null);
		} catch (e) {
			if (mounted) setUser(null);
		}

		return () => { mounted = false; };
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext) || { user: null };
}

export default AuthContext;
