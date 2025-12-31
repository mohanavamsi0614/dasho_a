import { useNavigate } from "react-router";
import { BackgroundBeams } from "../components/ui/background-beams";

function Home() {
  const nav = useNavigate();
  return (
    <div className="bg-[#212121] font-poppins flex w-full gap-10  h-screen justify-center items-center">
      {/* <BackgroundBeams className="fixed inset-0 z-0" /> */}
      <div
        className="relative z-10 cursor-pointer  border-2  w-80 p-15 flex justify-center items-center hover:bg-gray-300 hover:text-black hover:border-black rounded-xl text-white text-center font-semibold"
        onClick={() => nav("/qr")}
      >
        <p className=" w-fu">QR Code Event</p>
      </div>
      <div
        className="relative z-10 cursor-pointer  border-2  w-80 p-15 flex justify-center items-center hover:bg-gray-300 hover:text-black hover:border-black rounded-xl text-white text-center font-semibold"
        onClick={() => nav("/hackthon")}
      >
        Hackathon Event
      </div>
    </div>
  );
}
export default Home;
