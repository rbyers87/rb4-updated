import React, { useState, useEffect } from 'react';
    import { supabase } from '../../lib/supabase';
    import { useAuth } from '../../contexts/AuthContext';
    
    interface IconSettingsProps {
      onIconChange: () => void;
    }
    
    export function IconSettings({ onIconChange }: IconSettingsProps) {
      const { user } = useAuth();
      const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
      const [loading, setLoading] = useState(true);
      const [message, setMessage] = useState<string | null>(null);
    
      const icons = [
        '/icons/icon-192x192.png',
        '/icons/apple-icon-180x180.png',
        '/icons/android-icon-192x192.png',
        '/icons/favicon-32x32.png',
        '/icons/favicon-96x96.png',
        '/icons/favicon-16x16.png',
      ];
    
      useEffect(() => {
        async function fetchUserPreference() {
          if (!user) return;
          setLoading(true);
          try {
            const { data, error } = await supabase
              .from('user_preferences')
              .select('icon_choice')
              .eq('user_id', user.id)
              .single();
    
            if (error) {
              console.error('Error fetching user preference:', error);
            } else if (data) {
              setSelectedIcon(data.icon_choice);
            }
          } catch (error) {
            console.error('Error fetching user preference:', error);
          } finally {
            setLoading(false);
          }
        }
    
        fetchUserPreference();
      }, [user]);
    
      const handleIconSelect = async (icon: string) => {
        if (!user) return;
        setLoading(true);
        setMessage(null);
    
        try {
          const { error } = await supabase
            .from('user_preferences')
            .upsert(
              { user_id: user.id, icon_choice: icon },
              { onConflict: 'user_id' }
            );
    
          if (error) throw error;
          setSelectedIcon(icon);
          setMessage('Icon updated! Please reinstall the app to apply the changes.');
          onIconChange();
        } catch (error) {
          console.error('Error updating icon preference:', error);
          setMessage('Failed to update icon preference.');
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">App Icon Settings</h2>
          <p className="text-sm text-gray-500 mb-4">Select your preferred app icon.</p>
    
          <div className="grid grid-cols-3 gap-4 mb-6">
            {icons.map((icon) => (
              <div
                key={icon}
                className={`relative border rounded-md p-2 cursor-pointer hover:border-indigo-500 ${
                  selectedIcon === icon ? 'border-indigo-500' : 'border-gray-300'
                }`}
                onClick={() => handleIconSelect(icon)}
              >
                <img src={icon} alt="App Icon" className="w-full h-auto" />
                {selectedIcon === icon && (
                  <div className="absolute inset-0 bg-indigo-100 bg-opacity-50 flex items-center justify-center rounded-md">
                    <span className="text-indigo-600 font-bold">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
    
          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
      );
    }
