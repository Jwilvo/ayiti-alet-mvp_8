import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Akèy", icon: "🏠" },
  { to: "/rapòte", label: "Rapòte", icon: "📢" },
  { to: "/kat", label: "Kat", icon: "🗺️" },
  { to: "/sèvis", label: "Sèvis", icon: "📍" },
  { to: "/pwofil", label: "Pwofil", icon: "👤" },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="icon">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
