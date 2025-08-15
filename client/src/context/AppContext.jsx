import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import {useAuth , useUser} from '@clerk/clerk-react' ;
import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext() ;

export const AppContextProvider = (props) =>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY  

    // Validate environment variables
    if (!backendUrl) {
        console.error('Missing VITE_BACKEND_URL environment variable')
    }
    if (!currency) {
        console.error('Missing VITE_CURRENCY environment variable')
    }

    const navigate = useNavigate()

    const  {getToken} = useAuth() ;
    const {user} =  useUser()

    const [allCourses , setAllCourses] = useState([]) 
    const [isEducator , setIsEducator] = useState(false) 
     const [enrolledCourses , setEnrolledCourses] = useState([]) 
    const [userData , setUserData] = useState(null)

     const fetchAllCourses = async () =>{
    try {
      const {data} = await axios.get(backendUrl + '/api/courses')
        if(data.success) {
            console.log('Fetched all courses successfully');
            setAllCourses(data.courses);
        } else {
            toast.error(`Error: ${data.message}`);
            console.error('Failed to fetch courses:', data.message);
        }

      
    } catch (error) {
        toast.error(error.message || 'An error occurred while fetching courses');
        console.error('Error fetching courses:', error);
    }
 }

 // fetch user data 
const fetchUserData = async () => {
    if(user.publicMetadata.role === 'educator') {
        setIsEducator(true);
    }

    try {
        const token = await getToken();

        const {data} = await axios.get(backendUrl + '/api/user/data',{headers :
            {Authorization: `Bearer ${token}`}
        })
        if(data.success) {
            setUserData(data.user);
            console.log('Fetched user data successfully');
        } else {
            // If user not found, check profile status
            try {
                const profileResponse = await axios.get(backendUrl + '/api/user/profile-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (profileResponse.data.success) {
                    if (!profileResponse.data.profileComplete) {
                        // User exists but profile incomplete
                        setUserData({
                            _id: user.id,
                            email: user.primaryEmailAddress?.emailAddress || '',
                            name: 'Anonymous User',
                            imageUrl: '',
                            isProfileComplete: false
                        });
                    } else {
                        setUserData(profileResponse.data.user);
                    }
                } else {
                    // Create basic user data from Clerk
                    setUserData({
                        _id: user.id,
                        email: user.primaryEmailAddress?.emailAddress || '',
                        name: 'Anonymous User',
                        imageUrl: '',
                        isProfileComplete: false
                    });
                }
            } catch (profileError) {
                console.log('Profile status check failed, creating basic user data');
                // Create basic user data from Clerk
                setUserData({
                    _id: user.id,
                    email: user.primaryEmailAddress?.emailAddress || '',
                    name: 'Anonymous User',
                    imageUrl: '',
                    isProfileComplete: false
                });
            }
        }
    } catch (error) {
        console.log('User data fetch failed, creating basic user data from Clerk');
        // Create basic user data from Clerk
        setUserData({
            _id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: 'Anonymous User',
            imageUrl: '',
            isProfileComplete: false
        });
    }
}

//  function calculate rating

 const calculateRating = (course) =>{

    if(course.courseRatings.length === 0) {
        return 0;
    }
    let totalRating = 0
    course.courseRatings.forEach(rating =>{
        totalRating += rating.rating
    })
    return Math.floor(totalRating / course.courseRatings.length)
}

//  course chapter time 

const calculateChapterTime = (chapter) =>{
    let time = 0;
    chapter.chapterContent.map((lecture)=> time += lecture.lectureDuration)

    return humanizeDuration(time * 60 * 1000 ,{units:["h","m"]})
}

const calculateCourseDuration = (course)=>{
    let time = 0;
    course.courseContent.map((chapter) => chapter.chapterContent.map(
        (lecture)=> time += lecture.lectureDuration
    ))

    return humanizeDuration(time * 60 * 1000 ,{units :["h","m"]})
}

const calculateNoOfLectures = (course)=>{
    let totalLectures = 0 ;

    course.courseContent.forEach(chapter =>{
        if(Array.isArray(chapter.chapterContent)) {
            totalLectures += chapter.chapterContent.length;
        }
    });
    return totalLectures
}




// fetch userenrolled coourse 

const fetchUserEnrolledCourses = async ()=>{
  try {
     const token = await getToken();

   const {data} = await axios.get(backendUrl + '/api/user/enrolled-courses' , {
       headers : {Authorization: `Bearer ${token}`}
   })
   if(data.success) {
       setEnrolledCourses(data.enrolledCourses.reverse());
       console.log('Fetched enrolled courses successfully');
   } else {
       toast.error(`Error: ${data.message}`);
       console.error('Failed to fetch enrolled courses:', data.message);
   }
    
  } catch (error) {
      toast.error(error.message || 'An error occurred while fetching enrolled courses');
      console.error('Error fetching enrolled courses:', error); 
  }
}


 useEffect(()=>{
    fetchAllCourses();
    
 },[])


useEffect(()=>{
    if(user) {
       fetchUserData()
       fetchUserEnrolledCourses();
    }
},[user])


 const value = {
    currency , allCourses ,navigate ,calculateRating ,
    isEducator ,setIsEducator ,
    calculateNoOfLectures ,
    calculateCourseDuration,calculateChapterTime ,
    enrolledCourses ,fetchUserEnrolledCourses,
    backendUrl ,userData ,setUserData,getToken,fetchAllCourses

 }
return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
)

}