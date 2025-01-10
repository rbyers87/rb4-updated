import React from 'react';
    import { ProfileSettings } from '../components/settings/ProfileSettings';
    import { SecuritySettings } from '../components/settings/SecuritySettings';
    import { NotificationSettings } from '../components/settings/NotificationSettings';
    import { UserManagement } from '../components/settings/UserManagement';
    import { AdminSettings } from '../components/settings/AdminSettings';
    import { IconSettings } from '../components/settings/IconSettings';
    
    export default function Settings() {
      const [manifestUpdated, setManifestUpdated] = React.useState(false);
    
      const handleIconChange = () => {
        setManifestUpdated(true);
      };
    
      return (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          
          <div className="space-y-6">
            <ProfileSettings />
            <SecuritySettings />
            <NotificationSettings />
            <UserManagement />
            <AdminSettings />
            <IconSettings onIconChange={handleIconChange} />
            {manifestUpdated && (
              <p className="text-sm text-green-600">
                Your icon has been updated! Please reinstall the app from your browser settings to apply the changes.
              </p>
            )}
          </div>
        </div>
      );
    }
