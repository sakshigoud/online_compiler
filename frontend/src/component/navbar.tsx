export default function Navbar() {
  return (
    <nav className="topbar">
      <a href="/" className="brand-link">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark-core">{'</>'}</span>
          <span className="brand-mark-dot" />
        </span>
        <span className="brand-text">
          <strong>Online Compiler</strong>
          <small>Build, Run, Repeat</small>
        </span>
      </a>
    </nav>
  );
}
