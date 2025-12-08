/* eslint-disable react/prop-types */
import NavBar from './NavBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-[#ECE8E7]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
