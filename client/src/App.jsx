import React from 'react'
import { useMatch, Routes, Route } from 'react-router-dom'

import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollment from './pages/student/MyEnrollment'
import Player from './pages/student/Player'
import Loading from './components/students/Loading'

import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentEnrolled from './pages/educator/StudentEnrolled'

import Navbar from './components/students/Navbar'
import ProfileCompletion from './components/ProfileCompletion'
import { ToastContainer } from 'react-toastify'

function App() {

    const isEducatorRoute = useMatch('/educator/*')

    return (
        <>
            {/* Student Navbar */}
            {!isEducatorRoute && <Navbar />}

            <Routes>

                {/* ==================== */}
                {/* STUDENT ROUTES       */}
                {/* ==================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/course-list"
                    element={<CoursesList />}
                />

                <Route
                    path="/course-list/:input"
                    element={<CoursesList />}
                />

                <Route
                    path="/course/:id"
                    element={<CourseDetails />}
                />

                <Route
                    path="/my-enrollments"
                    element={<MyEnrollment />}
                />

                <Route
                    path="/player/:courseId"
                    element={<Player />}
                />

                <Route
                    path="/loading/:path"
                    element={<Loading />}
                />


                {/* ==================== */}
                {/* EDUCATOR ROUTES      */}
                {/* ==================== */}

                <Route
                    path="/educator"
                    element={<Educator />}
                >

                    {/* /educator */}
                    <Route
                        index
                        element={<Dashboard />}
                    />

                    {/* /educator/add-course */}
                    <Route
                        path="add-course"
                        element={<AddCourse />}
                    />

                    {/* /educator/my-courses */}
                    <Route
                        path="my-courses"
                        element={<MyCourses />}
                    />

                    {/* /educator/student-enrolled */}
                    <Route
                        path="student-enrolled"
                        element={<StudentEnrolled />}
                    />

                </Route>

            </Routes>


            {/* Profile Completion Modal */}
            <ProfileCompletion />

            {/* Toast Messages */}
            <ToastContainer />

        </>
    )
}

export default App