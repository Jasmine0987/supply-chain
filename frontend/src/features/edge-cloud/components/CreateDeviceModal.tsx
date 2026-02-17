import React, { useState } from 'react';

interface CreateDeviceModalProps {
  onClose: () => void;
  onCreate: (data: { device_id: string; device_type: string }) => void;
}

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({ onClose, onCreate }) => {
  const [deviceId, setDeviceId] = useState('');
  const [deviceType, setDeviceType] = useState<'iot_sensor' | 'raspberry_pi' | 'jetson_nano' | 'smartphone'>('raspberry_pi');

  const deviceTypes = [
    { value: 'iot_sensor', label: '📡 IoT Sensor', desc: 'Low-power sensor device' },
    { value: 'raspberry_pi', label: '🥧 Raspberry Pi', desc: 'General purpose SBC' },
    { value: 'jetson_nano', label: '🤖 Jetson Nano', desc: 'AI-capable edge device' },
    { value: 'smartphone', label: '📱 Smartphone', desc: 'Mobile device' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deviceId.trim()) {
      onCreate({ device_id: deviceId, device_type: deviceType });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Edge Device
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Device ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device ID
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g., device_001"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {/* Device Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device Type
            </label>
            <div className="space-y-2">
              {deviceTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    deviceType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="deviceType"
                    value={type.value}
                    checked={deviceType === type.value}
                    onChange={(e) => setDeviceType(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {type.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeviceModal;