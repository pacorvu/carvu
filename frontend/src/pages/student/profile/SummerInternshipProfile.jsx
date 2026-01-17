import { useState } from "react"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"
import { SummerInternshipForm } from "../../../components/student/forms/SummerInternshipForm"

export const SummerInternshipProfile = () => {
  const [data, setData] = useState([])

  return (
    <StudentProfileLayout>
      <SummerInternshipForm data={data} onUpdate={setData} isEditing={true} />
    </StudentProfileLayout>
  )
}

