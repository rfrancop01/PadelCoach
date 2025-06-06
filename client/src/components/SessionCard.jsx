import React from "react";
import { CalendarDays, Clock, MapPin, Signal } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { StudentTooltipAvatar } from './StudentTooltipAvatar';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const avatarColors = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
  "#9467bd", "#8c564b", "#e377c2", "#7f7f7f"
];

const getTextColor = (bgColor) => {
  const rgb = parseInt(bgColor.slice(1), 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? '#000' : '#fff';
};

const SessionCard = ({ session, onEdit, onDelete }) => {
  const { date, time, trainer, court, students = [] } = session;

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-90 backdrop-blur-sm rounded-xl shadow-md p-4 w-full transition transform hover:scale-[1.01] hover:shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {trainer?.name} {trainer?.last_name}
          </h3>
          {students.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
              <Signal className="w-4 h-4" />
              {students[0].level}
            </div>
          )}
          <div className="flex space-x-2">
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={onEdit}
                  className="text-white hover:text-blue-400 text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={5}
                  className="z-50 px-2 py-1 bg-white rounded shadow text-xs text-zinc-800"
                >
                  Editar sesión
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={onDelete}
                  className="text-white hover:text-red-500 text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="top"
                  align="center"
                  sideOffset={5}
                  className="z-50 px-2 py-1 bg-white rounded shadow text-xs text-zinc-800"
                >
                  Eliminar sesión
                  <Tooltip.Arrow className="fill-white" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-1 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {date}
          <Clock className="w-4 h-4 ml-4" />
          {time}
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {court?.name} — {court?.location}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {students.map((student, idx) => {
            const bgColor = avatarColors[student.id % avatarColors.length];
            const textColor = getTextColor(bgColor);
            return (
              <Tooltip.Root key={idx}>
                <Tooltip.Trigger asChild>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: bgColor, color: textColor, boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.7)' }}
                  >
                    {`${student?.user?.name?.[0] || ''}${student?.user?.last_name?.[0] || ''}`}
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    align="center"
                    sideOffset={5}
                    className="z-50 p-3 bg-white rounded-lg shadow-lg text-zinc-800 w-56"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm"
                        style={{ backgroundColor: bgColor }}
                      >
                        {`${student?.user?.name?.[0] || ''}${student?.user?.last_name?.[0] || ''}`}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {student?.user?.name} {student?.user?.last_name}
                        </div>
                        <div className="text-xs text-zinc-500">Nivel: {student?.level}</div>
                        <div className="text-xs text-zinc-500">📞 {student?.user?.phone}</div>
                      </div>
                    </div>
                    <Tooltip.Arrow className="fill-white" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
          {students.length < 4 &&
            Array(4 - students.length)
              .fill(null)
              .map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="border-2 border-dashed border-zinc-400 dark:border-zinc-500 w-8 h-8 rounded-full flex items-center justify-center text-xs text-zinc-400"
                  title="Plaza libre"
                >
                  ?
                </div>
              ))}
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default SessionCard;