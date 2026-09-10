import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from '../../components/educator/Navbar'
import Sidebar from '../../components/educator/Sidebar'
import Footer from '../../components/educator/Footer'
import { AppContext } from '../../context/AppContext'

const Educator = () => {
  const { userData } = useContext(AppContext)
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className='text-default min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='text-default min-h-screen bg-white'>
       <Navbar/>
       {!user ? (
         <div className='flex-1 flex items-center justify-center min-h-screen'>
           <div className='text-center'>
             <p className='text-lg text-gray-600 mb-4'>Please sign in to access the educator dashboard</p>
           </div>
         </div>
       ) : (
         <div className='flex '>
           <Sidebar/>
            <div className='flex-1'>
               <Outlet/>
            </div>
         </div>
       )}
      <Footer/>
    </div>
  )
}

export default Educator