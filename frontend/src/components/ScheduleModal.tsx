import React, { useState } from 'react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (publishAt: Date) => void;
  loading: boolean;
  error: string | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSchedule, loading, error }) => {
  const [selectedDateTime, setSelectedDateTime] = useState('');

  if (!isOpen) return null;

  const handleScheduleClick = () => {
    if (selectedDateTime) {
      onSchedule(new Date(selectedDateTime));
    }
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 5); // Minimum 5 minutes from now

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
        <h3 className="text-2xl font-bold mb-6 text-white">Schedule Post</h3>

        <div className="mb-6">
          <label htmlFor="schedule-datetime" className="block text-gray-300 text-sm font-bold mb-2">
            Publish Date and Time:
          </label>
          <input
            type="datetime-local"
            id="schedule-datetime"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-white bg-gray-900 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedDateTime}
            onChange={(e) => setSelectedDateTime(e.target.value)}
            min={minDateTime.toISOString().slice(0, 16)} // Set minimum date to 5 minutes from now
          />
        </div>

        {error && <div className="bg-red-600 p-3 rounded-lg text-white text-center mb-4">Error: {error}</div>}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleClick}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
            disabled={!selectedDateTime || loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : null}
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
