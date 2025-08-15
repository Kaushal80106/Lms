import React, { useState, useRef, useEffect, useContext } from 'react'
import uniqid from 'uniqid'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AddCourse = () => {
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const { backendUrl, getToken } = useContext(AppContext)
  const navigate = useNavigate()

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [chapters, setChapters] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [currentChaptersId, setCurrentChaptersId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  const [courseDescription, setCourseDescription] = useState('')

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChaptersId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  }

  const addLecture = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration || !lectureDetails.lectureUrl) {
      toast.error('Please fill in all lecture details');
      return;
    }

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChaptersId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder: chapter.chapterContent.length > 0 ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
            lectureId: uniqid()
          };
          chapter.chapterContent.push(newLecture)
        }
        return chapter;
      })
    )
    
    // Reset lecture details and close popup
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
    setShowPopup(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!courseTitle || !courseDescription || !image || chapters.length === 0) {
      toast.error('Please fill in all required fields and add at least one chapter');
      return;
    }

    if (chapters.some(chapter => chapter.chapterContent.length === 0)) {
      toast.error('Each chapter must have at least one lecture');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      
      // Prepare course data
      const courseData = {
        courseTitle,
        courseDescription,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters
      };

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', image);
      formData.append('courseContent', JSON.stringify(courseData));

      const response = await fetch(`${backendUrl}/api/educator/add-course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Course added successfully!');
        navigate('/educator/my-courses');
      } else {
        toast.error(result.message || 'Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter chapter name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8'>
      <div className='max-w-4xl mx-auto px-3 sm:px-4 lg:px-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800'>Add New Course</h1>
            <button
              onClick={() => navigate('/educator/my-courses')}
              className='px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base'
            >
              ← Back to My Courses
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
            {/* Course Thumbnail */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Thumbnail *
              </label>
              <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4'>
                <div className='w-full sm:w-32 h-24 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden'>
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Course thumbnail preview"
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='text-gray-400 text-center'>
                      <svg className='w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                      <span className='text-xs'>No image selected</span>
                    </div>
                  )}
                </div>
                <div className='flex flex-col space-y-2 w-full sm:w-auto'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e => setImage(e.target.files[0])} 
                    className='hidden'
                    id='thumbnailImage'
                    required
                  />
                  <label
                    htmlFor='thumbnailImage'
                    className='px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-center text-sm sm:text-base'
                  >
                    {image ? 'Change Image' : 'Upload Image'}
                  </label>
                  {image && (
                    <button
                      type='button'
                      onClick={() => setImage(null)}
                      className='px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base'
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                Recommended size: 800x600px. Max file size: 5MB. Supported formats: JPG, PNG, GIF.
              </p>
            </div>

            {/* Basic Course Information */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Course Title *
                </label>
                <input
                  type='text'
                  name='courseTitle'
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Course Price *
                </label>
                <input
                  type='number'
                  name='coursePrice'
                  value={coursePrice}
                  onChange={e => setCoursePrice(e.target.value)}
                  min='0'
                  step='0.01'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Discount (%)
                </label>
                <input
                  type='number'
                  name='discount'
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                />
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  name='isPublished'
                  checked={false} // This checkbox is not directly tied to state, so it's not used in the current form
                  onChange={() => {}}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label className='ml-2 block text-sm text-gray-700'>
                  Publish Course
                </label>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Description *
              </label>
              <textarea
                name='courseDescription'
                value={courseDescription}
                onChange={e => setCourseDescription(e.target.value)}
                rows='3'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                required
              />
            </div>

            {/* Course Content */}
            <div>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3'>
                <h3 className='text-base sm:text-lg font-medium text-gray-800'>Course Content</h3>
                <div 
                  className='inline-flex bg-blue-100 p-2 rounded cursor-pointer mt-2' 
                  onClick={() => handleChapter('add')}
                >
                  + Add Chapter
                </div>
              </div>

              <div className='space-y-3 sm:space-y-4'>
                {chapters.map((chapter, chapterIndex) => (
                  <div key={chapterIndex} className='border border-gray-200 rounded-lg p-3 sm:p-4'>
                    <div className='flex justify-between items-center p-4 border-b'>
                      <div className='flex items-center'>
                        <img 
                          onClick={() => handleChapter('toggle', chapter.chapterId)}
                          src={assets.dropdown_icon} 
                          width={14} 
                          alt="" 
                          className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && '-rotate-90'}`}
                        />
                        <span className='font-semibold'> {chapterIndex + 1} {chapter.chapterTitle}</span>
                      </div>
                      <span className='text-gray-500'>{chapter.chapterContent.length} Lectures</span>
                      <img 
                        onClick={() => handleChapter('remove', chapter.chapterId)} 
                        src={assets.cross_icon} 
                        alt="" 
                        className='cursor-pointer'
                      />
                    </div>
                    
                    {!chapter.collapsed && (
                      <div className='p-4'>
                        {chapter.chapterContent.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className='flex justify-between items-center mb-2'>
                            <span>
                              {lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins - 
                              <a href={lecture.lectureUrl} target='_blank' className='text-blue-500'> Link</a> - 
                              {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                            </span>
                            <img 
                              onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} 
                              src={assets.cross_icon} 
                              alt="" 
                              className='cursor-pointer'
                            />
                          </div>
                        ))}
                        <div 
                          className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2' 
                          onClick={() => handleLecture('add', chapter.chapterId)}
                        >
                          + Add Lectures
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => navigate('/educator/my-courses')}
                className='px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto'
              >
                Cancel
              </button>
              <button
                type='submit' 
                className='bg-black text-white w-max py-2.5 px-8 rounded my-4 disabled:opacity-50'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'ADD COURSE'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
          <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
            <h2 className='text-lg font-semibold mb-4'>Add Lectures</h2>
            
            <div className='mb-2'>
              <p>Lecture Title</p>
              <input 
                type="text"
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureTitle}
                onChange={(e) => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})}
                required
              />
            </div>

            <div className='mb-2'>
              <p>Duration (minutes)</p>
              <input 
                type="number"
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureDuration}
                onChange={(e) => setLectureDetails({...lectureDetails, lectureDuration: e.target.value})}
                required
              />
            </div>

            <div className='mb-2'>
              <p>Lecture URL</p>
              <input 
                type="text"
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureUrl}
                onChange={(e) => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})}
                required
              />
            </div>

            <div className='flex gap-2 my-4'>
              <p>Is Preview Free?</p>
              <input 
                type="checkbox"
                className='mt-1 scale-125'
                checked={lectureDetails.isPreviewFree}
                onChange={(e) => setLectureDetails({...lectureDetails, isPreviewFree: e.target.checked})}
              />
            </div>

            <button 
              type='button' 
              className='w-full bg-blue-400 text-white px-4 py-2 rounded' 
              onClick={addLecture}
            >
              Add
            </button>

            <img 
              onClick={() => setShowPopup(false)} 
              src={assets.cross_icon}
              className='absolute top-4 right-4 w-4 cursor-pointer' 
              alt="" 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AddCourse