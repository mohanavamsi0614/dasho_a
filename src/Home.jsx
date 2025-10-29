import { useNavigate } from "react-router";
import img from './assets/image1.png'
import img1 from './assets/image.png'
function Home() {
    const nav=useNavigate()
    return (
        <div className=" flex w-full  h-screen justify-center items-center">
  <div 
    className="cursor-pointer bg-gray-200 hover:bg-gray-300 p-4 rounded-xl text-center font-semibold"
    onClick={() => nav('/qr')}
  >
  <img src={img} className=" w-52 h-52"
  />
    QR Code Event
  </div>
  <div 
    className="cursor-pointer bg-gray-200 hover:bg-gray-300 p-4 rounded-xl text-center font-semibold"
    onClick={() => nav('/hackthon')}
  >
  <img src={img1} className=" w-52 h-52"
  />
    Hackathon Event
  </div>
</div>

    );
}   
export default Home;