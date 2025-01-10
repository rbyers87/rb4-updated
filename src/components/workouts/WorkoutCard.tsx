import React, { useState, useEffect } from 'react';
    import { Calendar, Clock, Dumbbell } from 'lucide-react';
    import { WorkoutLogger } from './WorkoutLogger';
    import { WorkoutEditor } from './WorkoutEditor';
    import { supabase } from '../../lib/supabase';
    import type { Workout, WorkoutExercise } from '../../types/workout';

    interface WorkoutCardProps {
      workout: Workout;
      onDelete: () => void;
    }

    export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
      const [isLogging, setIsLogging] = useState(false);
      const [isEditing, setIsEditing] = useState(false);
      const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
      const [loadingExercises, setLoadingExercises] = useState(true);

      useEffect(() => {
        async function fetchExercises() {
          setLoadingExercises(true);
          try {
            const { data, error } = await supabase
              .from('workout_exercises')
              .select(`
                *,
                exercise:exercises (*)
              `)
              .eq('workout_id', workout.id);

            if (error) throw error;
            setExercises(data || []);
          } catch (error) {
            console.error('Error fetching exercises:', error);
          } finally {
            setLoadingExercises(false);
          }
        }

        fetchExercises();
      }, [workout.id]);

      const handleClose = () => {
        setIsEditing(false);
        onDelete();
      };

      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString();
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{workout.name}</h3>
              {workout.description && (
                <p className="text-gray-600 mt-1">{workout.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              {workout.scheduled_date && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {formatDate(workout.scheduled_date)}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">~45 min</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loadingExercises ? (
              <p className="text-gray-500">Loading exercises...</p>
            ) : (
              exercises?.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <Dumbbell className="h-5 w-5 text-indigo-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{exercise.exercise.name}</p>
                      <p className="text-sm text-gray-500">
                        {exercise.exercise.name === 'Run' ? (
                          <>
                            {exercise.sets} sets × {exercise.distance} meters in {exercise.time} minutes
                          </>
                        ) : (
                          <>
                            {exercise.sets} sets × {exercise.reps} reps
                          {exercise.weight && ` @ ${exercise.weight}`}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => setIsLogging(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Start Workout
            </button>
          </div>

          {isLogging && (
            <WorkoutLogger
              workout={workout}
              onClose={() => setIsLogging(false)}
            />
          )}

          {isEditing && (
            <WorkoutEditor
              workout={workout}
              onClose={handleClose}
            />
          )}
        </div>
      );
    }
