import { X } from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { settings } = useAdmin();

  if (!isVisible || !settings.announcement.enabled) return null;

  return (
    <div className={`bg-gradient-to-r ${settings.announcement.backgroundColor} text-white py-2 px-4 text-center relative`}>
      <div className="flex items-center justify-center gap-2">
        <span className="animate-pulse">🔥</span>
        <span className="text-sm md:text-base">
          {settings.announcement.text}
        </span>
        <span className="animate-pulse">🔥</span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}