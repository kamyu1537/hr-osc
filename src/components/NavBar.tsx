import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const items = [
  { to: '/', label: 'Home' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
];

const NavBar = () => {
  const location = useLocation();

  return (
    <header className="mb-1">
      <ul className="flex gap-3">
        {items.map((item, idx) => (
          <li key={idx} className={cn(item.to === location.pathname && 'border-b-2 border-cyan-400')}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </header>
  );
};

export default NavBar;
