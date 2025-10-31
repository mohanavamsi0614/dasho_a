import { useNavigate } from "react-router";
import img from "./assets/image1.png";
import img1 from "./assets/image.png";
import { BackgroundBeams } from "./components/ui/background-beams";

function Home() {
  const nav = useNavigate();
  return (
    <div className="bg-[#212121] font-poppins flex w-full gap-10  h-screen justify-center items-center">
      <BackgroundBeams className="fixed inset-0 z-0" />
      <div
        className="relative z-10 cursor-pointer bg-[#181818] hover:bg-gray-300 p-4 rounded-xl text-white text-center font-semibold"
        onClick={() => nav("/qr")}
      >
        <img src={img} className=" w-52 h-52" />
        QR Code Event
      </div>
      <div
        className="relative z-10 cursor-pointer bg-[#181818] hover:bg-gray-300 p-4 rounded-xl text-white text-center font-semibold"
        onClick={() => nav("/hackthon")}
      >
        <img src={img1} className=" w-52 h-52" />
        Hackathon Event
      </div>
    </div>
  );
}
export default Home;
