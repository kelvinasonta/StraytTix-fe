import React from 'react';
import { Navigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  // Attendee profile and settings have been merged into /dashboard/settings
  return <Navigate to="/dashboard/settings" replace />;
};

export default Profile;
