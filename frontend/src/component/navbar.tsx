export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#161b22',
      borderBottom: '1px solid #30363d',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      height: '60px'
    }}>
      <a 
        href="/" 
        style={{
          textDecoration: 'none',
          color: '#58a6ff',
          fontSize: '20px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        Online Compiler
      </a>
    </nav>
  )
}
