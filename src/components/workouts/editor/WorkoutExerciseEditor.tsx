import React from 'react';
    import { Plus, Trash2 } from 'lucide-react';
    import { useExercises } from '../../../hooks/useExercises';
    import type { WorkoutExerciseFormData } from '../../../hooks/useWorkoutEditor';

    interface WorkoutExerciseEditorProps {
      exercises: WorkoutExerciseFormData[];
      onChange: (index: number, field: keyof WorkoutExerciseFormData, value: any) => void;
      onAdd: () => void;
      onRemove: (index: number) => void;
    }

    export function WorkoutExerciseEditor({ 
      exercises, 
      onChange, 
      onAdd, 
      onRemove 
    }: WorkoutExerciseEditorProps) {
      const { exercises: availableExercises, loading } = useExercises();

      if (loading) return null;

      const lbsToKg = (lbs: number) => {
        return Math.round(lbs / 2.20462);
      };

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Exercises</h3>
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Exercise</span>
            </button>
          </div>

          {exercises.map((exercise, index) => (
            <div key={index} className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Exercise {index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Exercise
                  </label>
                  <select
                    value={exercise.exercise_id}
                    onChange={(e) => onChange(index, 'exercise_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">Select exercise</option>
                    {availableExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sets
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => onChange(index, 'sets', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reps
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => onChange(index, 'reps', parseInt(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={exercise.weight ? Math.round(exercise.weight * 2.20462) : ''}
                      onChange={(e) => onChange(index, 'weight', lbsToKg(Number(e.target.value)))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
