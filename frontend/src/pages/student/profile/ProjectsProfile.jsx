import { ProjectsForm } from "../../../components/student/forms/ProjectsForm"
import { GenericProfileSection } from "./GenericProfileSection"

export const ProjectsProfile = () => {
  return <GenericProfileSection sectionKey="projects" FormComponent={ProjectsForm} />
}
