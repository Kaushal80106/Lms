import logo from './logo.svg'
import logo_dark from './logo_dark.svg'
import search_icon from './search_icon.svg'
import cross_icon from './cross_icon.svg'
import upload_area from './upload_area.svg'
import sketch from './sktech.svg'
import microsoft_logo from './microsoft_logo.svg'
import walmart_logo from './walmart_logo.svg'
import accenture_logo from './accenture_logo.svg'
import adobe_logo from './adobe_logo.svg'
import paypal_logo from './paypal_logo.svg'
import course_1_thumbnail from './course_1.png'
import course_2_thumbnail from './course_2.png'
import course_3_thumbnail from './course_3.png'
import course_4_thumbnail from './course_4.png'
import star from './rating_star.svg'
import star_blank from './star_dull_icon.svg'
import profile_img_1 from './profile_img_1.png'
import profile_img_2 from './profile_img_2.png'
import profile_img_3 from './profile_img_3.png'
import arrow_icon from './arrow_icon.svg'
import down_arrow_icon from './down_arrow_icon.svg'
import time_left_clock_icon from './time_left_clock_icon.svg'
import time_clock_icon from './time_clock_icon.svg'
import user_icon from './user_icon.svg'
import home_icon from './home_icon.svg'
import add_icon from './add_icon.svg'
import my_course_icon from './my_course_icon.svg'
import person_tick_icon from './person_tick_icon.svg'
import facebook_icon from './facebook_icon.svg'
import instagram_icon from './instagram_icon.svg'
import twitter_icon from './twitter_icon.svg'
import file_upload_icon from './file_upload_icon.svg'
import appointments_icon from './appointments_icon.svg'
import earning_icon from './earning_icon.svg'
import dropdown_icon from './dropdown_icon.svg'
import patients_icon from './patients_icon.svg'
import play_icon from './play_icon.svg'
import blue_tick_icon from './blue_tick_icon.svg'
import course_4 from './course_4.png'
import profile_img from './profile_img.png'
import profile_img2 from './profile_img2.png'
import profile_img3 from './profile_img3.png'
import lesson_icon from './lesson_icon.svg'


export const assets = {
    logo,
    search_icon,
    sketch,
    microsoft_logo,
    walmart_logo,
    accenture_logo,
    adobe_logo,
    paypal_logo,
    course_1_thumbnail,
    course_2_thumbnail,
    course_3_thumbnail,
    course_4_thumbnail,
    star,
    star_blank,
    profile_img_1,
    profile_img_2,
    profile_img_3,
    arrow_icon,
    dropdown_icon,
    cross_icon,
    upload_area,
    logo_dark,
    down_arrow_icon,
    time_left_clock_icon,
    time_clock_icon,
    user_icon,
    home_icon,
    add_icon,
    my_course_icon,
    person_tick_icon,
    facebook_icon,
    instagram_icon,
    twitter_icon,
    course_4,
    file_upload_icon,
    appointments_icon,
    earning_icon,
    patients_icon,
    profile_img,
    profile_img2,
    profile_img3,
    play_icon,
    blue_tick_icon,
    lesson_icon
}

export const dummyEducatorData = {
    "_id": "675ac1512100b91a6d9b8b24",
    "name": "GreatStack",
    "email": "user.greatstack@gmail.com",
    "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yclFkaDBOMmFqWnBoTTRBOXZUanZxVlo0aXYifQ",
    "createdAt": "2024-12-12T10:56:17.930Z",
    "updatedAt": "2024-12-12T10:56:17.930Z",
    "__v": 0
}

export const dummyTestimonial = [
    {
        name: 'Donald Jackman',
        role: 'Student',
        image: profile_img_1,
        rating: 5,
        comment: 'Great course! I learned a lot about JavaScript fundamentals.'
    },
    {
        name: 'Sarah Johnson',
        role: 'Student',
        image: profile_img_2,
        rating: 5,
        comment: 'Excellent content and clear explanations. Highly recommended!'
    },
    {
        name: 'Mike Chen',
        role: 'Student',
        image: profile_img_3,
        rating: 5,
        comment: 'The best JavaScript course I have ever taken. Very practical!'
    }
];

export const dummyCourses = [
    {
        "_id": "605c72efb3f1c2b1f8e4e1a1",
        "courseTitle": "Introduction to JavaScript",
        "courseDescription": "<h2>Learn the Basics of JavaScript</h2><p>JavaScript is a versatile programming language that powers the web. In this course, you will learn the fundamentals of JavaScript, including syntax, data types, and control structures.</p><p>This course is perfect for beginners who want to start their journey in web development. By the end of this course, you will be able to create interactive web pages and understand the core concepts of JavaScript.</p><ul><li>Understand the basics of programming</li><li>Learn how to manipulate the DOM</li><li>Create dynamic web applications</li></ul>",
        "coursePrice": 49.99,
        "isPublished": true,
        "discount": 20,
        "courseContent": [
            {
                "chapterId": "chapter1",
                "chapterTitle": "Getting Started with JavaScript",
                "chapterOrder": 1,
                "chapterContent": [
                    {
                        "lectureId": "lecture1",
                        "lectureTitle": "Introduction to JavaScript",
                        "lectureDuration": 15,
                        "lectureUrl": "https://www.youtube.com/watch?v=WbV3zRgpw_E",
                        "isPreviewFree": true,
                        "lectureOrder": 1
                    },
                    {
                        "lectureId": "lecture2",
                        "lectureTitle": "Setting Up Your Development Environment",
                        "lectureDuration": 20,
                        "lectureUrl": "https://www.youtube.com/watch?v=WbV3zRgpw_E",
                        "isPreviewFree": false,
                        "lectureOrder": 2
                    }
                ]
            }
        ],
        "educator": "675ac1512100b91a6d9b8b24",
        "enrolledStudents": [
            "user_2qjlgkAqIMpiR2flWIRzvWKtE0w"
        ],
        "courseRatings": [],
        "createdAt": "2024-12-17T08:16:53.622Z",
        "updatedAt": "2025-01-02T06:56:13.208Z",
        "__v": 1,
        "courseThumbnail": "https://img.youtube.com/vi/WbV3zRgpw_E/maxresdefault.jpg"
    }
]