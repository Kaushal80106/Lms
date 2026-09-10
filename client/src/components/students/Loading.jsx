import React, { useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const Loading = () => {
  const { path } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUserEnrolledCourses, backendUrl, getToken } = useContext(AppContext);

  const verifyPurchase = useCallback(async (sessionId) => {
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${backendUrl}/api/user/verify-purchase`, {
          params: { session_id: sessionId },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (data.success) return true;
      } catch (error) {
        const status = error.response?.status;
        if (status && status !== 401 && status !== 403) break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/verify-purchase`, {
        params: { session_id: sessionId },
      });
      return data.success;
    } catch {
      return false;
    }
  }, [backendUrl, getToken]);

  useEffect(() => {
    const finish = async () => {
      const sessionId = searchParams.get('session_id');

      if (sessionId) {
        const verified = await verifyPurchase(sessionId);
        if (!verified) {
          console.error('Purchase verification failed');
        }
      }

      if (path === 'my-enrollments') {
        await fetchUserEnrolledCourses().catch(() => {});
        navigate('/my-enrollments', { replace: true, state: { fromPayment: true } });
      } else if (path) {
        navigate(`/${path}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    };

    finish();
  }, [path, navigate, fetchUserEnrolledCourses, searchParams, verifyPurchase]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin mb-4' />
      {path === 'my-enrollments' ? (
        <div className='text-center'>
          <p className='text-green-600 text-xl font-semibold mb-2'>Payment Successful!</p>
          <p className='text-gray-600 text-lg'>Finalizing your enrollment...</p>
        </div>
      ) : (
        <p className='text-gray-600 text-lg'>Loading...</p>
      )}
    </div>
  );
};

export default Loading;
