import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext)
  const navigate = useNavigate()

  const handleCourseClick = () => {
    console.log('Opening course:', course._id)
    console.log('Course URL:', `/course/${course._id}`)

    window.scrollTo(0, 0)

    navigate(`/course/${course._id}`)
  }

  return (
    <div
      onClick={handleCourseClick}
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg cursor-pointer hover:shadow-md transition-shadow"
    >
      <img
        src={course.courseThumbnail}
        alt={course.courseTitle}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
          {course.courseTitle}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {course.educator?.name || 'Educator'}
        </p>

        <div className="flex items-center space-x-2 mt-3">
          <p>{calculateRating(course)}</p>

          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={
                  i < Math.floor(calculateRating(course))
                    ? assets.star
                    : assets.star_blank
                }
                alt=""
                className="w-3.5 h-3.5"
              />
            ))}
          </div>

          <p className="text-gray-500">
            ({course.courseRatings?.length || 0})
          </p>
        </div>

        <p className="text-base font-semibold text-gray-800 mt-2">
          {currency}
          {(
            course.coursePrice -
            (course.discount * course.coursePrice) / 100
          ).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default CourseCard