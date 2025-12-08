import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch { return null; }
  })();
  const nav = useNavigate();

  return (
    <nav className="bg-[#0b1220] border-b border-[#22303b]">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold">DashO</Link>
          <Link to="/qr" className="text-sm text-[#919294] hover:text-white">Create QR</Link>
          <Link to="/hackthon" className="text-sm text-[#919294] hover:text-white">Create Hackathon</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                <img src={user.imgUrl || user.logoUrl || ''} alt="avatar" className="h-8 w-8 rounded-full object-cover border" onClick={() => nav('/profile')} />
                <span className="text-sm">{user.orgName || user.name}</span>
              </Link>
              <button
                className="text-sm text-[#E16254] border border-[#E16254]/30 px-3 py-1 rounded"
                onClick={() => { localStorage.removeItem('user'); nav('/auth'); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-sm text-white bg-[#E16254] px-3 py-1 rounded">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
