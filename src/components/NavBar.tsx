import { Cog6ToothIcon, HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router';
import { cn } from '../lib/utils';

const items = [
  { to: '/', label: 'Home', Icon: HomeIcon },
  { to: '/settings', label: 'Settings', Icon: Cog6ToothIcon },
  { to: '/about', label: 'About', Icon: InformationCircleIcon },
];

const NavBar = () => {
  return (
    <nav className="-mx-2 -mb-2 mt-1 border-t border-neutral-800">
      <ul className="flex">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center gap-1 py-1.5 text-xs transition-colors',
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                )
              }
            >
              <Icon className="w-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
