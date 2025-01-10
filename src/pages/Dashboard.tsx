import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { DateSelector } from '../components/dashboard/DateSelector';
import { WorkoutOfTheDay } from '../components/dashboard/WorkoutOfTheDay';
import { RecentWorkouts } from '../components/dashboard/RecentWorkouts';
import { PersonalRecords } from '../components/dashboard/PersonalRecords';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { Workout } from '../types/workout';

export default function Dashboard() {
  const [wodWorkout, setWodWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    async function fetchWOD() {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('workouts')
          .select(`
            *,
            workout_exercises (
              *,
              exercise:exercises (*)
            )
          `)
          .eq('is_wod', true)
          .eq('scheduled_date', formattedDate)
          .limit(1);

        if (error) throw error;
        setWodWorkout(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching WOD:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWOD();
  }, [selectedDate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <DateSelector 
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />
          <WorkoutOfTheDay workout={wodWorkout} />
          <RecentWorkouts />
        </div>
        <PersonalRecords />
      </div>
    </div>
  );
}
