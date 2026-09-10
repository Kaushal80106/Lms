import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Footer from "../../components/students/Footer";
import YouTube from "react-youtube";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

const CourseDetails = () => {
  const { id } = useParams();
  const { user, isLoaded } = useUser();

  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const {
    calculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    backendUrl,
    userData,
    enrolledCourses,
    getToken,
  } = useContext(AppContext);

  // ============================================
  // FETCH COURSE DETAILS
  // ============================================

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      console.log("Fetching course with ID:", id);
      console.log("Course API:", `${backendUrl}/api/courses/${id}`);

      const { data } = await axios.get(
        `${backendUrl}/api/courses/${id}`
      );

      console.log("Course details response:", data);

      if (data.success) {
        const course = data.course || data.courseData;

        if (course) {
          setCourseData(course);
        } else {
          toast.error("Course data not found");
          setCourseData(null);
        }
      } else {
        toast.error(data.message || "Failed to fetch course");
        setCourseData(null);
      }
    } catch (error) {
      console.error("Course details error:", error);
      console.error("Response:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
        "Failed to load course details"
      );

      setCourseData(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PURCHASE / ENROLL COURSE
  // ============================================

  const enrollCourse = async () => {
    if (!user) {
      toast.warn("Please log in to enroll");
      return;
    }

    if (!courseData?._id) {
      toast.error("Course information is missing");
      return;
    }

    if (isAlreadyEnrolled) {
      toast.warn("You are already enrolled in this course");
      return;
    }

    setPurchasing(true);

    try {
      console.log("Starting purchase for course:", courseData._id);

      const token = await getToken();

      if (!token) {
        toast.error("Authentication token not available");
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        {
          courseId: courseData._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Purchase response:", data);

      if (data.success && data.session_url) {
        window.location.href = data.session_url;
        return;
      }

      toast.error(
        data.message || "Failed to start checkout"
      );
    } catch (error) {
      console.error("Purchase error:", error);
      console.error("Purchase response:", error.response?.data);

      const message =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while enrolling";

      toast.error(message);
    } finally {
      setPurchasing(false);
    }
  };

  // ============================================
  // FETCH COURSE WHEN ID CHANGES
  // ============================================

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  // ============================================
  // CHECK WHETHER USER IS ALREADY ENROLLED
  // ============================================

  useEffect(() => {
    if (!courseData) return;

    const enrolledFromUser =
      userData?.enrolledCourses?.some(
        (courseId) =>
          String(courseId) === String(courseData._id)
      );

    const enrolledFromList =
      enrolledCourses?.some(
        (course) =>
          String(course._id) === String(courseData._id)
      );

    setIsAlreadyEnrolled(
      Boolean(enrolledFromUser || enrolledFromList)
    );
  }, [userData, enrolledCourses, courseData]);

  // ============================================
  // TOGGLE CHAPTER
  // ============================================

  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ============================================
  // EDUCATOR NAME
  // ============================================

  const educatorName =
    typeof courseData?.educator === "object"
      ? courseData.educator?.name
      : courseData?.educator || "Educator";

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ============================================
  // COURSE NOT FOUND
  // ============================================

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Course not found
          </h2>

          <p className="text-gray-500 mt-2">
            Course ID: {id}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-5 px-5 py-2 bg-blue-600 text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // COURSE DETAILS UI
  // ============================================

  return (
    <>
      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* ============================================
            LEFT SIDE
        ============================================ */}

        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          <p
            className="pt-4 text-sm md:text-base"
            dangerouslySetInnerHTML={{
              __html:
                courseData.courseDescription?.slice(0, 200) ||
                "",
            }}
          />

          {/* Rating */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>

            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i <
                    Math.floor(
                      calculateRating(courseData)
                    )
                      ? assets.star
                      : assets.star_blank
                  }
                  alt=""
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>

            <p className="text-blue-600">
              ({courseData.courseRatings?.length || 0}{" "}
              {courseData.courseRatings?.length > 1
                ? "ratings"
                : "rating"}
              )
            </p>

            <p>
              {courseData.enrolledStudents?.length || 0}{" "}
              {courseData.enrolledStudents?.length > 1
                ? "Students"
                : "student"}
            </p>
          </div>

          {/* Educator */}
          <p className="text-sm">
            Course By{" "}
            <span className="text-blue-600 underline">
              {educatorName}
            </span>
          </p>

          {/* ============================================
              COURSE STRUCTURE
          ============================================ */}

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">
              Course Structure
            </h2>

            <div className="pt-5">
              {courseData.courseContent?.map(
                (chapter, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 bg-white mb-2 rounded"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                      onClick={() =>
                        toggleSection(index)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <img
                          className={`transform transition-transform ${
                            openSection[index]
                              ? "rotate-180"
                              : ""
                          }`}
                          src={assets.down_arrow_icon}
                          alt="arrow icon"
                        />

                        <p className="font-medium text-sm md:text-base">
                          {chapter.chapterTitle}
                        </p>
                      </div>

                      <p className="text-sm">
                        {chapter.chapterContent?.length || 0}{" "}
                        lectures -{" "}
                        {calculateChapterTime(chapter)}
                      </p>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openSection[index]
                          ? "max-h-96"
                          : "max-h-0"
                      }`}
                    >
                      <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                        {chapter.chapterContent?.map(
                          (lecture, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 py-1"
                            >
                              <img
                                src={assets.play_icon}
                                alt="play icon"
                                className="w-4 mt-1"
                              />

                              <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-sm">
                                <p>
                                  {lecture.lectureTitle}
                                </p>

                                <div>
                                  {lecture.isPreviewFree && (
                                    <p
                                      onClick={() =>
                                        setPlayerData({
                                          videoId: lecture.lectureUrl.includes("v=") ? lecture.lectureUrl.split("v=")[1].split("&")[0] : lecture.lectureUrl.split("/").pop(),
                                        })
                                      }
                                      className="text-blue-500 cursor-pointer"
                                    >
                                      Preview
                                    </p>
                                  )}

                                  <p>
                                    {humanizeDuration(
                                      lecture.lectureDuration *
                                        60 *
                                        1000,
                                      {
                                        units: ["h", "m"],
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Description */}

          <div className="py-20 text-sm md:text-base">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>

            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html:
                  courseData.courseDescription || "",
              }}
            />
          </div>
        </div>

        {/* ============================================
            RIGHT SIDE - PURCHASE CARD
        ============================================ */}

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px] h-fit">

          {playerData ? (
            <YouTube
              videoId={playerData.videoId}
              opts={{
                playerVars: {
                  autoplay: 1,
                },
              }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img
              src={courseData.courseThumbnail}
              alt={courseData.courseTitle}
              className="w-full"
            />
          )}

          <div className="p-5">

            {/* Price */}

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 text-2xl md:text-4xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount *
                    courseData.coursePrice) /
                    100
                ).toFixed(2)}
              </p>

              <p className="text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>

              <p className="text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>

            {/* Course stats */}

            <div className="flex items-center text-sm gap-4 pt-4 text-gray-500">

              <div className="flex items-center gap-1">
                <img
                  src={assets.star}
                  alt="star icon"
                />

                <p>
                  {calculateRating(courseData)}
                </p>
              </div>

              <div className="h-4 w-px bg-gray-500/40" />

              <div className="flex items-center gap-1">
                <img
                  src={assets.time_clock_icon}
                  alt="clock icon"
                />

                <p>
                  {calculateCourseDuration(courseData)}
                </p>
              </div>

              <div className="h-4 w-px bg-gray-500/40" />

              <div className="flex items-center gap-1">
                <img
                  src={assets.lesson_icon}
                  alt="lesson icon"
                />

                <p>
                  {calculateNoOfLectures(courseData)} lessons
                </p>
              </div>
            </div>

            {/* ============================================
                ENROLL BUTTON
            ============================================ */}

            {isLoaded && (
              <button
                onClick={enrollCourse}
                disabled={
                  purchasing ||
                  isAlreadyEnrolled ||
                  !user
                }
                className="mt-6 w-full py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {!user
                  ? "Log in to Enroll"
                  : purchasing
                  ? "Redirecting to checkout..."
                  : isAlreadyEnrolled
                  ? "Already Enrolled"
                  : "Enroll Now"}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;