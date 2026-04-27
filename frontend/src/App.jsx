import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
export const serverUrl="https://vingo-backend-b4xs.onrender.com"
const App = () => {
  useGetCurrentUser()
  useGetCity()
  useGetMyShop()
  const {userData, authChecked}=useSelector(state=>state.user)

  if (!authChecked) {
    return (
      <div className="auth-shell">
        <div className="auth-card max-w-sm text-center">
          <p className="section-kicker">Loading</p>
          <h1 className="section-title">Preparing Vingo</h1>
          <p className="section-copy">
            We are checking your session and setting up the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
  <Routes>
      
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"} />}/>
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"} />}/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"} />}/>
      <Route path='/' element={userData?<Home/>:<Navigate to ={"/signin"}/> }/>
      <Route path='/create-edit-shop' element={userData?<CreateEditShop/>:<Navigate to ={"/signin"}/> }/>
      <Route path='/add-food' element={userData?<AddItem/>:<Navigate to ={"/signin"}/> }/>
      <Route path='/cart' element={userData?<CartPage/>:<Navigate to ={"/signin"}/> }/>
      <Route path='/orders' element={userData?<OrdersPage/>:<Navigate to ={"/signin"}/> }/>
     

     
     </Routes>
  )
}

export default App
