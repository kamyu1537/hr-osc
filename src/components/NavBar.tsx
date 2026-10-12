import { NavLink } from 'react-router';

const items = [
  { to: '/', label: 'Home' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
];

const NavBar = () => {
  return (
    <nav className="mb-1">
      <ul className="flex gap-3">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'border-b-2 border-white text-white'
                  : 'border-b-2 border-transparent text-neutral-300 transition-colors hover:text-white'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
