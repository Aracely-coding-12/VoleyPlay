import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>VoleyPlay</h1>
      <ul>
        <li>
          <Link to="/canchas">Canchas</Link>
        </li>
        <li>
          <Link to="/pagos">Pagos</Link>
        </li>
      </ul>
    </nav>
  );
}