import React from 'react';
import ApplicationItem from './ApplicationItem';

export default function ApplicationsList({ items = [] }) {
  return (
    <div className="space-y-3">
      {items.map(app => (
        <ApplicationItem key={app.applicationId} app={app} />
      ))}
    </div>
  );
}
