import React, { useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const { fetchUserEnrolledCourses } = useContext(AppContext);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      // If path is 'my-enrollments', refresh data and navigate to the my-enrollments page
      if (path === 'my-enrollments') {
        try {
          // Refresh enrolled courses data to include the newly purchased course
          await fetchUserEnrolledCourses();
        } catch (error) {
          console.error('Error refreshing enrolled courses:', error);
        }
        navigate('/my-enrollments', { state: { fromPayment: true } });
      } else {
        // For other paths, navigate to the specified path
        navigate(`/${path}`);
      }
    }, 3000); // Reduced to 3 seconds for better UX
    
    return () => clearTimeout(timeout);
  }, [path, navigate, fetchUserEnrolledCourses]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='w-16 sm:w-20 aspect-square border-4
      border-gray-300 border-t-4 border-t-blue-400 rounded-full 
      animate-spin mb-4'></div>
      {path === 'my-enrollments' ? (
        <div className='text-center'>
          <p className='text-green-600 text-xl font-semibold mb-2'>🎉 Payment Successful!</p>
          <p className='text-gray-600 text-lg'>Redirecting to your enrollments...</p>
        </div>
      ) : (
        <p className='text-gray-600 text-lg'>Loading...</p>
      )}
    </div>
  )
}

export default Loading