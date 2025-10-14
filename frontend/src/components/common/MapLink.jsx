import React from 'react';
import getMapUrl from '../../utils/getMapUrl';

export default function MapLink({ address, children, className = '', title }) {
	if (!address) return null;
	const href = getMapUrl(address);
	function handleClick(e) {
		// prefer normal anchor behavior, but also provide a JS fallback
		try {
			// Some platforms or SPA routers may intercept anchor clicks; force open in new tab
				window.open(href, '_blank', 'noopener');
				e.preventDefault();
				e.stopPropagation();
		} catch (err) {
			// nothing
		}
	}

	return (
		<a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={`text-blue-600 hover:underline ${className}`} title={title || address}>
			{children || address}
		</a>
	);
}
