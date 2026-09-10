import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../../assets/assets'

const StudentEnrolled = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext)

  const [enrolledStudents, setEnrolledStudents] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true)

      const token = await getToken()

      const { data } = await axios.get(
        `${backendUrl}/api/educator/enrolled-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents)
        setSummary(data.summary)

        console.log('Fetched enrolled students:', data.enrolledStudents)
        console.log('Summary:', data.summary)
      } else {
        toast.error(data.message || 'Failed to fetch enrolled students')
        setEnrolledStudents([])
        setSummary(null)
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error)

      toast.error('Failed to fetch enrolled students. Please try again.')

      setEnrolledStudents([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrolledStudents()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 text-lg">
          Loading students...
        </p>
      </div>
    )
  }

  // No students
  if (!enrolledStudents || enrolledStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No Enrolled Students Yet
        </h2>

        <p className="text-gray-500 mb-6">
          You don't have any students enrolled in your courses yet.
        </p>

        <button
          onClick={() => {
            window.location.href = '/educator/add-course'
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Course
        </button>
      </div>
    )
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Enrolled Students
        </h1>

        <button
          onClick={fetchEnrolledStudents}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Total Students
            </h3>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {summary.totalStudents}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Total Courses
            </h3>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {summary.totalCourses}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Total Purchases
            </h3>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
              {summary.totalPurchases}
            </p>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">
              Total Revenue
            </h3>

            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">
              {currency}
              {summary.totalRevenue}
            </p>
          </div>

        </div>
      )}

      {/* Mobile Card View */}
      <div className="w-full sm:hidden space-y-3">

        {enrolledStudents.map((studentData) => (
          <div
            key={studentData.id}
            className="bg-white border border-gray-200 rounded-lg p-3 space-y-3"
          >

            {/* Student */}
            <div className="flex items-center space-x-3">

              <img
                src={studentData.student?.imageUrl || assets.profile_img_1}
                alt="Student"
                className="w-9 h-9 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0">

                <p className="font-medium text-gray-800 text-sm">
                  {studentData.student?.name || 'Unknown Student'}
                </p>

                <p className="text-xs text-gray-500">
                  {studentData.student?.email || 'No email'}
                </p>

              </div>

            </div>

            {/* Courses */}
            <div className="space-y-2">

              <div className="text-xs text-gray-500">
                Courses Enrolled:
              </div>

              {studentData.courses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                >

                  {course.courseThumbnail ? (
                    <img
                      src={course.courseThumbnail}
                      alt="Course"
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs">
                      C
                    </div>
                  )}

                  <span className="text-xs">
                    {course.courseTitle}
                  </span>

                </div>
              ))}

            </div>

            {/* Student Statistics */}
            <div className="grid grid-cols-2 gap-2 text-xs">

              <div>
                <span className="text-gray-500">
                  Total Spent:
                </span>

                <p className="font-medium text-green-600">
                  {currency}
                  {studentData.totalSpent}
                </p>
              </div>

              <div>
                <span className="text-gray-500">
                  Courses:
                </span>

                <p className="font-medium">
                  {studentData.totalCourses}
                </p>
              </div>

            </div>

            {/* Status */}
            <div className="flex items-center justify-center">

              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Enrolled
              </span>

            </div>

          </div>
        ))}

      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block w-full">

        <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">

          <table className="table-fixed md:table-auto w-full overflow-hidden pb-4">

            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">

              <tr>

                <th className="px-3 sm:px-4 py-3 font-semibold text-center hidden sm:table-cell">
                  #
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Student
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Courses Enrolled
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell">
                  Total Spent
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell">
                  First Enrollment
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell">
                  Last Enrollment
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="text-sm text-gray-500">

              {enrolledStudents.map((studentData) => (

                <tr
                  key={studentData.id}
                  className="border-b border-gray-500/20 hover:bg-gray-50"
                >

                  <td className="px-3 sm:px-4 py-3 text-center hidden sm:table-cell">
                    {studentData.id}
                  </td>

                  {/* Student */}
                  <td className="px-3 sm:px-4 py-3">

                    <div className="flex items-center space-x-3">

                      <img
                        src={
                          studentData.student?.imageUrl ||
                          assets.profile_img_1
                        }
                        alt="Student"
                        className="w-9 h-9 rounded-full object-cover"
                      />

                      <div className="flex flex-col">

                        <span className="font-medium text-gray-800">
                          {studentData.student?.name ||
                            'Unknown Student'}
                        </span>

                        <span className="text-xs text-gray-500">
                          {studentData.student?.email ||
                            'No email'}
                        </span>

                      </div>

                    </div>

                  </td>

                  {/* Courses */}
                  <td className="px-3 sm:px-4 py-3">

                    <div className="space-y-1">

                      {studentData.courses.map((course, index) => (

                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >

                          {course.courseThumbnail ? (
                            <img
                              src={course.courseThumbnail}
                              alt="Course"
                              className="w-6 h-6 rounded object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs">
                              C
                            </div>
                          )}

                          <span className="text-xs">
                            {course.courseTitle}
                          </span>

                        </div>

                      ))}

                    </div>

                  </td>

                  {/* Total Spent */}
                  <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">

                    <span className="font-medium text-green-600">
                      {currency}
                      {studentData.totalSpent}
                    </span>

                  </td>

                  {/* First Enrollment */}
                  <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">

                    {studentData.firstEnrollment
                      ? new Date(
                          studentData.firstEnrollment
                        ).toLocaleDateString()
                      : 'N/A'}

                  </td>

                  {/* Last Enrollment */}
                  <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">

                    {studentData.lastEnrollment
                      ? new Date(
                          studentData.lastEnrollment
                        ).toLocaleDateString()
                      : 'N/A'}

                  </td>

                  {/* Status */}
                  <td className="px-3 sm:px-4 py-3">

                    <div className="flex flex-col items-start space-y-1">

                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Enrolled
                      </span>

                      <span className="text-xs text-gray-500">
                        {studentData.totalCourses}{' '}
                        course
                        {studentData.totalCourses !== 1
                          ? 's'
                          : ''}
                      </span>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Additional Insights */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

        {/* Recent Enrollments */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">

          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
            Recent Enrollments
          </h3>

          <div className="space-y-2">

            {[...enrolledStudents]
              .sort(
                (a, b) =>
                  new Date(b.lastEnrollment) -
                  new Date(a.lastEnrollment)
              )
              .slice(0, 5)
              .map((student, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >

                  <span className="text-xs sm:text-sm font-medium">
                    {student.student?.name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {student.lastEnrollment
                      ? new Date(
                          student.lastEnrollment
                        ).toLocaleDateString()
                      : 'N/A'}
                  </span>

                </div>

              ))}

          </div>

        </div>

        {/* Top Spenders */}
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">

          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
            Top Spenders
          </h3>

          <div className="space-y-2">

            {[...enrolledStudents]
              .sort(
                (a, b) =>
                  b.totalSpent - a.totalSpent
              )
              .slice(0, 5)
              .map((student, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >

                  <span className="text-xs sm:text-sm font-medium">
                    {student.student?.name}
                  </span>

                  <span className="text-xs sm:text-sm font-bold text-green-600">
                    {currency}
                    {student.totalSpent}
                  </span>

                </div>

              ))}

          </div>

        </div>

      </div>

      {/* Course Management Actions */}
      <div className="mt-4 sm:mt-6 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">

        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
          Course Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          <button
            onClick={() => {
              window.location.href = '/educator/add-course'
            }}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Add New Course
          </button>

          <button
            onClick={() => {
              window.location.href = '/educator/my-courses'
            }}
            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Manage Courses
          </button>

          <button
            onClick={fetchEnrolledStudents}
            className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            Refresh Data
          </button>

        </div>

      </div>

    </div>
  )
}

export default StudentEnrolled