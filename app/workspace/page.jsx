import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'
import EnrollCourseList from './_components/EnrollCourseList'
import Link from "next/link";


function Workspace() {
  return (
    <div>
      <WelcomeBanner />
      <EnrollCourseList/>
      <CourseList />
    </div>
  )
}




export default Workspace