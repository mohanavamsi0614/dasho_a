/* eslint-disable react/prop-types */
import NavBar from './NavBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-[#ECE8E7]">
      <NavBar />
      <main className="w-full h-full">{children}</main>
    </div>
  );
}
