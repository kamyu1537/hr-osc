import { NavLink } from 'react-router';
import { cn } from '../lib/utils';

const items = [
  { to: '/', label: 'Home' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
];

const NavBar = () => {
  return (
    <nav className="h-9 shrink-0 border-t border-neutral-900">
      <ul className="flex">
        {items.map(({ to, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'block pt-2 text-center text-xs transition-colors',
                  isActive ? 'text-neutral-50' : 'text-neutral-400 hover:text-white'
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
