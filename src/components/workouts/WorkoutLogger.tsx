import React, { useState } from 'react';
    import { supabase } from '../../lib/supabase';
    import { useAuth } from '../../contexts/AuthContext';
    import { ExercisePercentages } from './ExercisePercentages';
    import type { Workout, WorkoutExercise } from '../../types/workout';
    
    interface WorkoutLoggerProps {
      workout: Workout;
      onClose: () => void;
    }
    
    interface ExerciseLog {
      exercise_id: string;
      sets: Array<{
        weight: number;
        reps: number;
        distance?: number;
        time?: number;
        calories?: number;
      }>;
    }
    
    export function WorkoutLogger({ workout, onClose }: WorkoutLoggerProps) {
      const { user } = useAuth();
      const [logs, setLogs] = useState<ExerciseLog[]>(
        workout.workout_exercises?.map((exercise) => ({
          exercise_id: exercise.exercise_id,
          sets: Array(exercise.sets).fill({
            weight: exercise.weight || 0,
            reps: exercise.reps,
            distance: exercise.distance,
            time: exercise.time,
            calories: exercise.calories,
          }),
        })) || []
      );
      const [notes, setNotes] = useState('');
    
      const handleSetChange = (
        exerciseIndex: number,
        setIndex: number,
        field: 'weight' | 'reps' | 'distance' | 'time' | 'calories',
        value: number
      ) => {
        setLogs((prevLogs) => {
          const newLogs = [...prevLogs];
          newLogs[exerciseIndex].sets[setIndex] = {
            ...newLogs[exerciseIndex].sets[setIndex],
            [field]: value,
          };
          return newLogs;
        });
      };
    
      const handleAddSet = (exerciseIndex: number) => {
        setLogs((prevLogs) => {
          const newLogs = [...prevLogs];
          const exercise = workout.workout_exercises?.[exerciseIndex];
          if (exercise) {
            newLogs[exerciseIndex].sets.push({
              weight: exercise.weight || 0,
              reps: exercise.reps,
              distance: exercise.distance,
              time: exercise.time,
              calories: exercise.calories,
            });
          }
          return newLogs;
        });
      };
    
      const calculateScore = (exercise: WorkoutExercise, log: ExerciseLog, workoutType: string) => {
        // Calculate score based on exercise type
        if (exercise.exercise.name === 'Run') {
          // Score for Run is based on total distance
          return log.sets.reduce((total, set) => total + (set.distance || 0), 0);
        } else if (exercise.exercise.name === 'Assault Bike') {
          // Score for Assault Bike is based on total calories
          return log.sets.reduce((total, set) => total + (set.calories || 0), 0);
        } else if (workoutType === 'weight training') {
          // Score for weight training workouts is based on the heaviest weight used
          let maxWeight = 0;
          log.sets.forEach(set => {
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          });
          return maxWeight;
        } else {
          // Score for other exercises is based on the heaviest weight used
          let maxWeight = 0;
          log.sets.forEach(set => {
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
            }
          });
          return maxWeight;
        }
      };
    
      const calculateTotal = (exercise: WorkoutExercise, log: ExerciseLog) => {
        if (exercise.exercise.name === 'Run') {
          return log.sets.reduce((total, set) => {
            return total + (set.distance || 0);
          }, 0);
        } else if (exercise.exercise.name === 'Assault Bike') {
          return log.sets.reduce((total, set) => {
            return total + (set.calories || 0);
          }, 0);
        } else {
          return log.sets.reduce(
            (total, set) => total + set.weight * set.reps,
            0
          );
        }
      };
    
      const handleSubmit = async () => {
        if (!user) {
          alert('User is not logged in.');
          return;
        }
    
        try {
          const { data: workoutLog, error: workoutError } = await supabase
            .from('workout_logs')
            .insert({
              user_id: user.id,
              workout_id: workout.id,
              notes,
              score: logs.reduce((total, log, index) => {
                const exercise = workout.workout_exercises?.[index];
                 return total + (exercise ? calculateScore(exercise, log, workout.type) : 0);
              }, 0),
              total: logs.reduce((total, log, index) => {
                const exercise = workout.workout_exercises?.[index];
                return total + (exercise ? calculateTotal(exercise, log) : 0);
              }, 0),
            })
            .select()
            .single();
    
          if (workoutError) throw workoutError;
    
          const exerciseScores = logs.flatMap((log, index) => {
            const exercise = workout.workout_exercises?.[index];
            if (!exercise) return [];
    
            return log.sets.map((set) => ({
              user_id: user.id,
              workout_log_id: workoutLog.id,
              exercise_id: log.exercise_id,
              weight: set.weight,
              reps: set.reps,
              distance: set.distance,
              time: set.time,
              calories: set.calories,
            }));
          });
    
          const { error: scoresError } = await supabase
            .from('exercise_scores')
            .insert(exerciseScores);
    
          if (scoresError) throw scoresError;
    
          alert('Workout logged successfully!');
          onClose();
        } catch (error) {
          console.error('Error logging workout:', error);
          alert(`Failed to log workout: ${error.message || 'Unknown error'}`);
        }
      };
    
      const formatTime = (minutes: number | undefined): string => {
        if (minutes === undefined) return '00:00';
        const totalSeconds = Math.round(minutes * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      };
    
      return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Log Workout: {workout.name}
            </h2>
    
            <div className="space-y-6">
              {workout.workout_exercises?.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-3">
                    {exercise.exercise.name}
                  </h3>
    
                  <ExercisePercentages 
                    exerciseId={exercise.exercise_id}
                    exerciseName={exercise.exercise.name}
                  />
    
                  <div className="space-y-3 mt-4">
                    {Array.from({ length: logs[exerciseIndex]?.sets?.length || 0 }).map((_, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-3 gap-4">
                        <div className="text-sm text-gray-500">
                          Set {setIndex + 1}
                        </div>
                        {exercise.exercise.name === 'Run' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Distance (m)</label>
                              <input
                                type="number"
                                value={logs[exerciseIndex].sets[setIndex].distance}
                                onChange={(e) =>
                                  handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'distance',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-md border-gray-300"
                                placeholder="Distance (m)"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Time (min)</label>
                              <input
                                type="number"
                                value={logs[exerciseIndex].sets[setIndex].time}
                                onChange={(e) =>
                                  handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'time',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-md border-gray-300"
                                placeholder="Time (min)"
                              />
                            </div>
                          </>
                        ) : exercise.exercise.name === 'Assault Bike' ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Calories</label>
                              <input
                                type="number"
                                value={logs[exerciseIndex].sets[setIndex].calories}
                                onChange={(e) =>
                                  handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'calories',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-md border-gray-300"
                                placeholder="Calories"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Time (min)</label>
                              <input
                                type="number"
                                value={logs[exerciseIndex].sets[setIndex].time}
                                onChange={(e) =>
                                  handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'time',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-md border-gray-300"
                                placeholder="Time (min)"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
    <input
      type="number"
      value={logs[exerciseIndex].sets[setIndex].weight || ''} // Default to empty string if weight is null or undefined
      onChange={(e) =>
        handleSetChange(
          exerciseIndex,
          setIndex,
          'weight',
          e.target.value ? Number(e.target.value) : null // Convert to number, or null if empty
        )
      }
      className="w-full rounded-md border-gray-300"
      placeholder="Weight"
    />
    
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Reps</label>
                              <input
                                type="number"
                                value={logs[exerciseIndex].sets[setIndex].reps}
                                onChange={(e) =>
                                  handleSetChange(
                                    exerciseIndex,
                                    setIndex,
                                    'reps',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full rounded-md border-gray-300"
                                placeholder="Reps"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddSet(exerciseIndex)}
                      className="mt-2 text-indigo-600 font-medium hover:underline"
                    >
                      Add Set
                    </button>
                  </div>
                </div>
              ))}
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border-gray-300"
                  rows={3}
                />
              </div>
    
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Complete Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
