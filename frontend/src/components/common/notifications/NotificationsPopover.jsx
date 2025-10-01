import React, { useEffect, useRef, useState } from 'react'

// Tailwind-only Notifications popover
// - fixed positioning (calculates viewport coords) so it won't trigger any Modal/scroll-lock
// - updates on scroll/resize using rAF
// - click-away and Esc-to-close
// - accepts `notifications` prop array (optional)

export default function NotificationsPopover({
	notifications: initialNotifications = null,
	maxHeight = 64, // in rem-ish (Tailwind units via style)
}) {
	const [open, setOpen] = useState(false)
	const [pos, setPos] = useState({ top: 0, left: 0 })
	const [notifications, setNotifications] = useState(() => {
		if (initialNotifications && Array.isArray(initialNotifications)) return initialNotifications
		// fallback mock data
		return [
			{ id: 1, title: 'New candidate applied', body: 'John Doe applied for Frontend Dev', when: '2h', read: false },
			{ id: 2, title: 'Subscription expiring', body: 'Your plan will expire in 3 days', when: '1d', read: false },
			{ id: 3, title: 'System update', body: 'We deployed an update to improve matching', when: '3d', read: true },
		]
	})

	const anchorRef = useRef(null)
	const popRef = useRef(null)
	const rafRef = useRef(null)

	const unreadCount = notifications.filter(n => !n.read).length

	function calculatePosition() {
		const anchor = anchorRef.current
		const pop = popRef.current
		if (!anchor || !pop) return

		const rect = anchor.getBoundingClientRect()
		// place popover BELOW the anchor and align its RIGHT edge with the anchor's right edge
		const popWidth = Math.min(pop.offsetWidth || 320, 400)
		const popHeight = pop.offsetHeight || 240
		const offset = 8

		// desired left so pop's right edge matches anchor.right
		let left = Math.round(rect.right - popWidth)
		// clamp left so it stays within viewport
		left = Math.max(offset, Math.min(left, window.innerWidth - popWidth - offset))

		// desired top: below the anchor
		let top = Math.round(rect.bottom + offset)

		// if not enough space below, try placing above the anchor
		if (top + popHeight > window.innerHeight - offset) {
			top = Math.round(rect.top - popHeight - offset)
			// clamp to viewport
			top = Math.max(offset, top)
		}

		setPos({ top, left })
	}

	useEffect(() => {
		if (!open) return

		let mounted = true

		const onFrame = () => {
			if (!mounted) return
			calculatePosition()
			rafRef.current = requestAnimationFrame(onFrame)
		}

		rafRef.current = requestAnimationFrame(onFrame)

		const onResize = () => calculatePosition()
		window.addEventListener('resize', onResize)
		window.addEventListener('orientationchange', onResize)

		return () => {
			mounted = false
			cancelAnimationFrame(rafRef.current)
			window.removeEventListener('resize', onResize)
			window.removeEventListener('orientationchange', onResize)
		}
	}, [open])

	// click-away + Esc
	useEffect(() => {
		if (!open) return

		const onMousedown = (e) => {
			const pop = popRef.current
			const anchor = anchorRef.current
			if (!pop || !anchor) return
			if (pop.contains(e.target) || anchor.contains(e.target)) return
			setOpen(false)
		}

		const onKey = (e) => {
			if (e.key === 'Escape') setOpen(false)
		}

		document.addEventListener('mousedown', onMousedown)
		document.addEventListener('touchstart', onMousedown)
		document.addEventListener('keydown', onKey)

		return () => {
			document.removeEventListener('mousedown', onMousedown)
			document.removeEventListener('touchstart', onMousedown)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	useEffect(() => {
		// when opening, calculate position immediately and then let rAF update
		if (open) calculatePosition()
	}, [open])

	function toggle(e) {
		if (e && e.preventDefault) e.preventDefault()
		console.debug('NotificationsPopover.toggle (before):', { open })
		setOpen(v => {
			console.debug('NotificationsPopover.toggle toggling to', !v)
			return !v
		})
	}

	useEffect(() => {
		console.debug('NotificationsPopover open state changed:', open)
	}, [open])

	// debugging helpers: allow opening/closing from browser console
	useEffect(() => {
		console.debug('NotificationsPopover mounted')
		const openFn = () => setOpen(true)
		const closeFn = () => setOpen(false)
		try {
			window.__openNotificationsPopover = openFn
			window.__closeNotificationsPopover = closeFn
		} catch (e) {
			// ignore (non-browser env)
		}

		return () => {
			try {
				if (window.__openNotificationsPopover === openFn) delete window.__openNotificationsPopover
				if (window.__closeNotificationsPopover === closeFn) delete window.__closeNotificationsPopover
			} catch (e) { /* ignore */ }
		}
	}, [])

	function markAllRead() {
		setNotifications(prev => prev.map(n => ({ ...n, read: true })))
	}

	function openNotification(id) {
		setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
		// placeholder: navigate/open detail
	}

	return (
		<div className="relative inline-block">
			<button
				type="button"
				ref={anchorRef}
				onClick={toggle}
				aria-expanded={open}
				aria-haspopup="dialog"
				className="relative p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-45 focus:outline-none focus:ring-2 focus:ring-indigo-500 pointer-events-auto"
				title="Notifications"
			>
				{/* Bell icon (simple SVG) */}
				<svg className="w-6 h-6 text-black-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>

				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
						{unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div
					ref={popRef}
					role="dialog"
					aria-label="Notifications"
					className="z-50 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
					style={{ position: 'fixed', top: pos.top + 'px', left: pos.left + 'px', transform: 'translateZ(0)' }}
				>
					<div className="flex items-center justify-between px-4 py-2 border-b">
						<h3 className="text-sm font-medium text-gray-900">Notifications</h3>
						<div className="flex items-center gap-2">
							<button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
							<button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
								<svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>

					<div className="max-h-64 overflow-auto">
						<ul className="divide-y">
							{notifications.length === 0 && (
								<li className="p-4 text-sm text-gray-500">No notifications</li>
							)}
							{notifications.map((n) => (
								<li key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.read ? 'bg-white' : 'bg-gray-50'}`} onClick={() => openNotification(n.id)}>
									<div className="flex-shrink-0">
										<span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${n.read ? 'bg-gray-200 text-gray-600' : 'bg-indigo-500 text-white'}`}>
											{n.title ? n.title[0] : 'N'}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
										<p className="text-sm text-gray-500 truncate">{n.body}</p>
									</div>
									<div className="flex-shrink-0 text-xs text-gray-400">{n.when}</div>
								</li>
							))}
						</ul>
					</div>

					<div className="px-4 py-2 border-t text-center">
						<button className="text-sm text-indigo-600 hover:underline">View all</button>
					</div>
				</div>
			)}
		</div>
	)
}

