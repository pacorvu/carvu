import { useState } from "react"
import { SummerImmersionForm } from "../../../components/student/forms/SummerImmersionForm"
import { StudentProfileLayout } from "../../../components/student/StudentProfileLayout"

export const SummerImmersionProfile = () => {
  const [data, setData] = useState({ immersion: [], internship: [] })

  return (
    <StudentProfileLayout>
      <SummerImmersionForm data={data} onUpdate={setData} isEditing={true} />
    </StudentProfileLayout>
  )
}
