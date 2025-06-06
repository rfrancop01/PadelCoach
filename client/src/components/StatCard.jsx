import React from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  UsersIcon,
  CalendarIcon,
  ClipboardIcon,
  LayoutIcon,
  FileTextIcon
} from 'lucide-react';

const icons = {
  Usuarios: <UsersIcon className="text-primary h-8 w-8" />,
  Alumnos: <UserIcon className="text-green-500 h-8 w-8" />,
  Entrenadores: <UserIcon className="text-yellow-500 h-8 w-8" />,
  Sesiones: <CalendarIcon className="text-blue-500 h-8 w-8" />,
  Pistas: <LayoutIcon className="text-pink-500 h-8 w-8" />,
  Planes: <FileTextIcon className="text-purple-500 h-8 w-8" />,
};

export const StatCard = ({ title, label, value }) => {
  const icon = icons[title] || <div className="h-8 w-8" />;

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-4"
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-gray-500 capitalize">
          {label}
        </h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
};