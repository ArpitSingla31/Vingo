import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import Nav from "../components/Nav"

function Home() {
  const { userData } = useSelector((state) => state.user);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="app-shell flex min-h-screen w-full flex-col items-center pt-[104px]">

      {/* USER */}
      {userData.role === "user" && (
        <>
          <Nav />
          <UserDashboard />
        </>
      )}

      {/* OWNER */}
      {userData.role === "owner" && <OwnerDashboard />}

      {/* DELIVERY */}
      {userData.role === "deliveryboy" && <DeliveryBoy />}

    </div>
  );
}

export default Home;
