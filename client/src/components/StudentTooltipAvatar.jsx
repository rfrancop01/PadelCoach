import { PhoneIcon } from '@heroicons/react/24/solid';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip'

export const StudentTooltipAvatar = ({ student }) => {
  const user = student.user

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {user.photo_url ? (
            <img
              src={`http://localhost:8000/uploads/${user.photo_url}`}
              alt={`${user.name} ${user.last_name}`}
              className="w-10 h-10 rounded-full border cursor-pointer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-white cursor-pointer">
              {user.name.charAt(0)}
              {user.last_name.charAt(0)}
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent className="bg-white p-3 rounded-lg shadow-lg border max-w-xs z-50">
          <div className="flex items-center gap-3">
            {user.photo_url ? (
              <img
                src={`http://localhost:8000/uploads/${user.photo_url}`}
                alt="Foto"
                className="w-12 h-12 rounded-full border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-white">
                {user.name.charAt(0)}
                {user.last_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.name} {user.last_name}</p>
              <p className="text-sm text-gray-600">Nivel: {student.level}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                {user.phone}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}