import { clerkClient } from '@clerk/express'
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/course.js'
import  Purchase  from '../models/purchase.js'
import course from '../models/course.js'

export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth().userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })

        res.status(200).json({ success: true, message: 'you can publish a course now' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// add new course
export const addCourse = async (req, res) => {
    try {
        const imageFile = req.file;
        const educatorId = req.auth().userId;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'Thumbnail not attached' });
        }

        // Parse all course data from courseContent key
        let courseData;
        try {
            courseData = JSON.parse(req.body.courseContent);
        } catch (err) {
            console.log('PARSE ERROR:', err, req.body.courseContent);
            return res.status(400).json({ success: false, message: 'Invalid courseContent format' });
        }

        const {
            courseTitle,
            courseDescription,
            coursePrice,
            discount,
            courseContent
        } = courseData;

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

      
        // Sample code to create a new course
const newCourse = await Course.create({
  courseTitle,
  courseDescription,
  courseThumbnail: imageUpload.secure_url,
  coursePrice: Number(coursePrice),
  isPublished: true, // or false, as needed
  discount: Number(discount),
  courseContent,
  educator: educatorId,
  enrolledStudents: [], // or add user IDs
  courseRatings: []     // or add initial ratings
});

        res.status(201).json({ success: true, message: 'Course Added', course: newCourse });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// get educator courses

export const getEducatorCourses = async (req,res) => {
     try {
        const educator = req.auth().userId 

        const courses = await Course.find({educator})

        res.json({success:true,courses})
     } catch (error) {
        res.json({success:false,message:error.message})
     }
}

//  get educator dashbaord data

export const educatorDashboardData = async () =>{
    try {
        const educator = req.auth().userId

        const courses = await Course.find({educator})
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id) ;

        //calculate total earnings from purchase 
        const purchases  = await Purchase.find({
            courseId:{$in:courseIds},
            status:'completed'
        });

        const totalEarnings = purchases.reduce((sum,purchase)=>sum + purchase.amount,0);
        //collect unique enrolled students id with course title

        const enrolledStudentsData = [] ;
        for(const course of courses ) {
            const students = await User.find({
                _id:{$in:course.enrolledStudents}
            },'name imageurl') ;

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle:course.courseThumbnail,
                    student
                })
            });

            res.json({success:true,dashboardData :{
                totalEarnings,
                enrolledStudentsData,
                totalCourses

            }})
        }

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


//get enrolled students data with purchase data


export const getEnrolledStudentsData = async (req,res)=>{
    try {
        const educator = req.auth().userId ;
        const courses = await Course.find({educator});
        const courseIds = courses.map(course => course._id);
        const purchase = await Purchase.find({
            courseId:{$in: courseIds},
            status:'completed'
        }).populate('userId','name imageUrl').populate('courseId','courseTitle') 

        const enrolledStudents = purchase.map(purchase => ({
              student:purchase.userId ,
              courseTitle:purchase.courseId.courseTitle,
              purchaseDate:purchase.createdAt
        })) ;
        res.json({success:true , enrolledStudents})

    } catch (error) {
        res.json({success:false ,message:error.message})
    }
}