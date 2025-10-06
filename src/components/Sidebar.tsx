import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut, 
  Target 
} from 'lucide-react';

const sidebarLinks = [
  {
    name: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    path: '/dashboard',
  },
  {
    name: 'Clients',
    icon: <Users className="w-5 h-5" />,
    path: '/clients',
  },
  {
    name: 'Receipts',
    icon: <FileText className="w-5 h-5" />,
    path: '/receipts',
  },
  {
    name: 'Tasks',
    icon: <Target className="w-5 h-5" />,
    path: '/tasks',
  },
  {
    name: 'Reports',
    icon: <Calendar className="w-5 h-5" />,
    path: '/reports',
  },
  {
    name: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
  },
  {
    name: 'Logout',
    icon: <LogOut className="w-5 h-5" />,
    path: '/logout',
  },
];

const Sidebar = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Arkive</h2>
      </div>
      
      <ul>
        {sidebarLinks.map(link => (
          <li key={link.name}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;