import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Container,
  Spinner,
  useToast,
  SimpleGrid,
  Grid,
  Icon,
  Stack,
  Divider,
  Link,
  Input,
  Select,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { ArrowBackIcon, SearchIcon, StarIcon } from '@chakra-ui/icons';
import { 
  FaUser, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaBell, FaExclamationCircle,
  FaAddressBook, FaGraduationCap, FaProjectDiagram, FaChalkboardTeacher, 
  FaCertificate, FaBook, FaMedal, FaList, FaFileAlt, FaChartBar, FaUsers, 
  FaLinkedin, FaGithub, FaGlobe, FaPhone, FaEnvelope, FaDownload, FaEye, FaMapMarkerAlt
} from "react-icons/fa";
import AdminLayout from '../../components/AdminLayout';
import AlumniLayout from '../../components/AlumniLayout';
import CompanyLayout from '../../components/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { PlacementService } from '../../services/placement.service';
import { StudentProfileService } from '../../services/studentProfile.service';
import { calculateProfileCompletion } from "../../utils/profileHelper";

// --- Sub-components for Sections ---

const StatCard = ({ icon, title, value, color }) => (
  <Box bg="white" p={6} borderRadius="xl" shadow="sm" borderLeft="4px solid" borderColor={color}>
    <HStack gap={4}>
      <Box p={3} bg={`${color}10`} borderRadius="full" color={color}>
        {icon}
      </Box>
      <Box>
        <Text color="gray.500" fontSize="sm">{title}</Text>
        <Heading size="lg" color="#20343c">{value}</Heading>
      </Box>
    </HStack>
  </Box>
)

const JobCard = ({ company, role, status, date, isReadOnly }) => {
  let colorScheme = "blue";
  if (status === "Selected" || status === "Offer Accepted") colorScheme = "green";
  else if (status === "Rejected") colorScheme = "red";
  else if (status === "Interview") colorScheme = "orange";

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor="gray.100" 
      _hover={!isReadOnly ? { borderColor: "#d4a960", shadow: "md" } : {}} 
      transition="all 0.2s"
    >
      <HStack justify="space-between" mb={2}>
        <Heading size="sm" color="#20343c">{company}</Heading>
        <Badge colorScheme={colorScheme}>{status}</Badge>
      </HStack>
      <Text fontSize="sm" color="gray.600" mb={2}>{role}</Text>
      <Text fontSize="xs" color="gray.400">{new Date(date).toLocaleDateString()}</Text>
    </Box>
  )
}

const DashboardView = ({ applications, completionPercentage, showNotification, navigate, isReadOnly }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const totalApplications = applications.length;
  const interviewsScheduled = applications.filter(app => app.interview_status === "Pending" || app.interview_status === "Scheduled").length;
  const offersReceived = applications.filter(app => app.final_select_status === "Selected").length;

  const filteredApplications = applications.filter(app => {
    const companyName = app.company?.company_name || "Unknown Company";
    const role = app.drive?.job_type || "Role";
    const status = app.final_select_status !== "Pending" ? app.final_select_status : app.registration_status;
    
    const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const { user } = useAuth();
  const isAlumni = user?.role === 'alumni';

  return (
    <Box>
      <Heading size="lg" mb={6} color="#20343c">Dashboard Overview</Heading>
      
      {showNotification && (
        <Box mb={8} bg="orange.50" p={4} borderRadius="lg" borderLeft="4px solid" borderColor="orange.400" display="flex" justifyContent="space-between" alignItems="center">
          <HStack gap={3}>
            <FaExclamationCircle color="#dd6b20" size={20} />
            <Box>
              <Heading size="sm" color="orange.800">Complete Profile</Heading>
              <Text fontSize="sm" color="orange.700">Profile is {completionPercentage}% complete.</Text>
            </Box>
          </HStack>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6} mb={8}>
        <StatCard icon={<FaBriefcase />} title="Total Applications" value={totalApplications} color="#20343c" />
        <StatCard icon={<FaCalendarAlt />} title="Interviews Scheduled" value={interviewsScheduled} color="#d4a960" />
        <StatCard icon={<FaCheckCircle />} title="Offers Received" value={offersReceived} color="green" />
        <StatCard icon={<FaUser />} title="Profile Completeness" value={`${completionPercentage}%`} color="blue" />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={8}>
        <Box>
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
              <Heading size="md" color="#20343c">Recent Applications</Heading>
              <HStack spacing={2}>
                  <InputGroup size="sm" maxW="200px">
                      <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.300" />
                      </InputLeftElement>
                      <Input 
                          placeholder="Search..." 
                          bg="white" 
                          borderRadius="md"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </InputGroup>
                  <Select 
                      placeholder="Status" 
                      size="sm" 
                      maxW="130px" 
                      bg="white"
                      borderRadius="md"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                  >
                      <option value="Applied">Applied</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Interview">Interview</option>
                  </Select>
              </HStack>
          </Flex>
          <VStack gap={4} align="stretch" bg="white" p={6} borderRadius="xl" shadow="sm">
            {filteredApplications.length === 0 ? (
              <Text color="gray.500">No applications found.</Text>
            ) : (
              filteredApplications.map((app) => (
                <JobCard 
                  key={app.id}
                  company={app.company?.company_name || "Unknown Company"} 
                  role={app.drive?.job_type || "Role"} 
                  status={app.final_select_status !== "Pending" ? app.final_select_status : app.registration_status} 
                  date={app.created_at} 
                  isReadOnly={isReadOnly}
                />
              ))
            )}
          </VStack>
        </Box>

        <Box>
          <Heading size="md" color="#20343c" mb={4}>Upcoming Interviews</Heading>
          <VStack gap={4} align="stretch" bg="white" p={6} borderRadius="xl" shadow="sm">
            <Box borderLeft="4px solid #d4a960" pl={4} py={1}>
              <Text fontWeight="bold" color="#20343c">Google - Technical Round</Text>
              <Text fontSize="sm" color="gray.500">Tomorrow, 10:00 AM</Text>
            </Box>
            <Box borderLeft="4px solid #d4a960" pl={4} py={1}>
              <Text fontWeight="bold" color="#20343c">Amazon - OA</Text>
              <Text fontSize="sm" color="gray.500">Fri, Oct 24, 6:00 PM</Text>
            </Box>
            {!isReadOnly && (
            <Box mt={4} p={4} bg="blue.50" borderRadius="lg">
              <Heading size="xs" color="blue.700" mb={2}>Placement Tip</Heading>
              <Text fontSize="xs" color="blue.600">
                Update your resume with your latest project before the Google interview.
              </Text>
            </Box>
            )}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

const SectionContainer = ({ title, children }) => (
  <Card borderRadius="xl" shadow="sm" bg="white">
    <CardBody p={8}>
      <Heading size="md" mb={6} color="#20343c" borderBottom="1px solid" borderColor="gray.100" pb={4}>
        {title}
      </Heading>
      {children}
    </CardBody>
  </Card>
);

const PersonalSection = ({ data }) => (
  <SectionContainer title="Personal Information">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <Box>
        <Text color="gray.500" fontSize="sm">Full Name</Text>
        <Text fontWeight="medium">{data.fullName}</Text>
      </Box>
      <Box>
        <Text color="gray.500" fontSize="sm">USN</Text>
        <Text fontWeight="medium">{data.usn}</Text> {/* USN might be outside personal object usually */}
      </Box>
      <Box>
        <Text color="gray.500" fontSize="sm">Gender</Text>
        <Text fontWeight="medium">{data.gender}</Text>
      </Box>
      <Box>
        <Text color="gray.500" fontSize="sm">Date of Birth</Text>
        <Text fontWeight="medium">{data.dateOfBirth}</Text>
      </Box>
       <Box>
        <Text color="gray.500" fontSize="sm">Program</Text>
        <Text fontWeight="medium">{data.programId}</Text>
      </Box>
       <Box>
        <Text color="gray.500" fontSize="sm">Specialization</Text>
        <Text fontWeight="medium">{data.specializationId}</Text>
      </Box>
    </SimpleGrid>
  </SectionContainer>
);

const ContactSection = ({ data }) => (
  <SectionContainer title="Contact & Links">
    <VStack align="stretch" spacing={6}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box>
          <Text color="gray.500" fontSize="sm">College Email</Text>
          <HStack><Icon as={FaEnvelope} color="gray.400" /><Text fontWeight="medium">{data.collegeEmail}</Text></HStack>
        </Box>
        <Box>
          <Text color="gray.500" fontSize="sm">Personal Email</Text>
           <HStack><Icon as={FaEnvelope} color="gray.400" /><Text fontWeight="medium">{data.personalEmail}</Text></HStack>
        </Box>
        <Box>
          <Text color="gray.500" fontSize="sm">Phone Number</Text>
           <HStack><Icon as={FaPhone} color="gray.400" /><Text fontWeight="medium">{data.phoneCountryCode} {data.phoneNumber}</Text></HStack>
        </Box>
      </SimpleGrid>
      <Divider />
      <Box>
        <Text color="gray.500" fontSize="sm" mb={3}>Social Links</Text>
        <HStack spacing={4}>
           {data.links.linkedin && (
              <Button as="a" href={data.links.linkedin} target="_blank" leftIcon={<FaLinkedin />} size="sm" colorScheme="blue" variant="outline">LinkedIn</Button>
           )}
           {data.links.github && (
              <Button as="a" href={data.links.github} target="_blank" leftIcon={<FaGithub />} size="sm" colorScheme="gray" variant="outline">GitHub</Button>
           )}
           {data.links.portfolio && (
              <Button as="a" href={data.links.portfolio} target="_blank" leftIcon={<FaGlobe />} size="sm" colorScheme="teal" variant="outline">Portfolio</Button>
           )}
        </HStack>
      </Box>
    </VStack>
  </SectionContainer>
);

const EducationSection = ({ data }) => (
  <SectionContainer title="Education">
    <VStack align="stretch" spacing={6}>
      {data.map((edu, i) => (
        <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
           <HStack justify="space-between" mb={2}>
              <Heading size="sm" color="#20343c">{edu.instituteName}</Heading>
              <Badge>{edu.yearOfPassing}</Badge>
           </HStack>
           <Text fontSize="sm" color="gray.600" mb={1}>{edu.educationLevel} - {edu.board}</Text>
           <Text fontSize="sm">Result: <b>{edu.result} {edu.resultType}</b></Text>
        </Box>
      ))}
    </VStack>
  </SectionContainer>
);

const ProjectsSection = ({ data }) => (
  <SectionContainer title="Projects">
     <VStack align="stretch" spacing={6}>
      {data.map((proj, i) => (
        <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
           <HStack justify="space-between" mb={2}>
              <Heading size="sm" color="#20343c">{proj.title}</Heading>
              {proj.projectLink && <Link href={proj.projectLink} isExternal color="blue.500" fontSize="sm">View Project</Link>}
           </HStack>
           <Text fontSize="sm" color="gray.600" mb={3}>{proj.description}</Text>
           <HStack spacing={2} flexWrap="wrap">
              {proj.skills.map((skill, j) => (
                  <Badge key={j} colorScheme="blue" variant="subtle">{skill}</Badge>
              ))}
           </HStack>
        </Box>
      ))}
    </VStack>
  </SectionContainer>
);

const FamilySection = ({ data }) => (
  <SectionContainer title="Parent / Guardian Details">
     {(!data || data.length === 0) ? (
          <Text color="gray.500">No details added.</Text>
      ) : (
        <VStack align="stretch" spacing={6}>
          {data.map((parent, i) => (
             <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm" color="#20343c">{parent.parentType} - {parent.name}</Heading>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                   <Box>
                      <Text color="gray.500" fontSize="sm">Occupation</Text>
                      <Text fontWeight="medium">{parent.occupation}</Text>
                   </Box>
                   <Box>
                      <Text color="gray.500" fontSize="sm">Contact</Text>
                      <Text fontWeight="medium">{parent.phoneCountryCode} {parent.phoneNumber}</Text>
                   </Box>
                </SimpleGrid>
             </Box>
          ))}
        </VStack>
      )}
  </SectionContainer>
);

const InternshipsSection = ({ data }) => (
  <SectionContainer title="Internships">
     {(!data || data.length === 0) ? (
          <Text color="gray.500">No internships added.</Text>
      ) : (
          <VStack align="stretch" spacing={6}>
            {data.map((job, i) => (
              <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm" color="#20343c">{job.jobRole} at {job.organization}</Heading>
                    <Badge colorScheme="blue">{job.startDate} - {job.endDate}</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={2}>{job.description}</Text>
                  <HStack>
                     <Icon as={FaMapMarkerAlt} color="gray.400" />
                     <Text fontSize="xs" color="gray.500">{job.location}</Text>
                  </HStack>
              </Box>
            ))}
          </VStack>
      )}
  </SectionContainer>
);

const CertificationsSection = ({ data }) => (
  <SectionContainer title="Certifications">
     {(!data || data.length === 0) ? (
          <Text color="gray.500">No certifications added.</Text>
      ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {data.map((cert, i) => (
              <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                  <Heading size="sm" color="#20343c" mb={1}>{cert.name}</Heading>
                  <Text fontSize="sm" color="gray.600" mb={2}>{cert.issuingOrganization}</Text>
                  <Text fontSize="xs" color="gray.400">Issued: {cert.issueDate}</Text>
              </Box>
            ))}
          </SimpleGrid>
      )}
  </SectionContainer>
);

const PublicationsSection = ({ data }) => (
   <SectionContainer title="Publications">
      {(!data || data.length === 0) ? (
          <Text color="gray.500">No publications added.</Text>
      ) : (
          <VStack align="stretch" spacing={4}>
              {data.map((pub, i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                      <Heading size="sm" color="#20343c" mb={1}>{pub.title}</Heading>
                      <Text fontSize="sm" color="gray.600" mb={2}>{pub.journal} - {pub.year}</Text>
                      {pub.link && <Link href={pub.link} isExternal color="blue.500" fontSize="sm">Read Publication</Link>}
                  </Box>
              ))}
          </VStack>
      )}
   </SectionContainer>
);

const AcademicsSection = ({ data }) => (
   <SectionContainer title="Academic Performance">
      {(!data || data.length === 0) ? (
          <Text color="gray.500">No academic details added.</Text>
      ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
              {data.map((sem, i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50">
                      <Heading size="sm" color="#20343c" mb={2}>Semester {sem.semester}</Heading>
                      <Text fontSize="sm" color="gray.600">Year: {sem.academicYear}</Text>
                      <Heading size="lg" color="#d4a960" my={2}>{sem.sgpa} <span style={{fontSize: "14px", color: "#718096"}}>SGPA</span></Heading>
                      <HStack fontSize="xs" color="gray.500" spacing={4}>
                          <Text>Backlogs: {sem.liveBacklogs}</Text>
                          <Text>Closed: {sem.closedBacklogs}</Text>
                      </HStack>
                  </Box>
              ))}
          </SimpleGrid>
      )}
   </SectionContainer>
);

const TrainingsSection = ({ data }) => (
   <SectionContainer title="Training & Workshops">
      {(!data || data.length === 0) ? (
          <Text color="gray.500">No trainings added.</Text>
      ) : (
          <VStack align="stretch" spacing={4}>
              {data.map((item, i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                      <HStack justify="space-between" mb={1}>
                          <Heading size="sm" color="#20343c">{item.title}</Heading>
                          <Text fontSize="sm" color="gray.500">{item.year}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">{item.organizer}</Text>
                      <Text fontSize="sm" mt={2}>{item.description}</Text>
                  </Box>
              ))}
          </VStack>
      )}
   </SectionContainer>
);

const ExtraCurricularSection = ({ data }) => (
   <SectionContainer title="Extra-Curricular Activities">
      {(!data || data.length === 0) ? (
          <Text color="gray.500">No activities added.</Text>
      ) : (
          <VStack align="stretch" spacing={4}>
              {data.map((item, i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                      <Heading size="sm" color="#20343c" mb={1}>{item.activity}</Heading>
                      <Text fontSize="sm" color="gray.600" mb={1}>{item.role}</Text>
                      <Text fontSize="sm">{item.description}</Text>
                  </Box>
              ))}
          </VStack>
      )}
   </SectionContainer>
);

const OtherExperiencesSection = ({ data }) => (
   <SectionContainer title="Other Experiences">
      {(!data || data.length === 0) ? (
          <Text color="gray.500">No other experiences added.</Text>
      ) : (
          <VStack align="stretch" spacing={4}>
              {data.map((item, i) => (
                  <Box key={i} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100">
                      <Heading size="sm" color="#20343c" mb={1}>{item.title}</Heading>
                      <Text fontSize="sm" color="gray.600">{item.description}</Text>
                  </Box>
              ))}
          </VStack>
      )}
   </SectionContainer>
);

const ResumeSection = () => (
    <SectionContainer title="Resume">
        <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.200" borderStyle="dashed" textAlign="center">
            <Icon as={FaFileAlt} w={10} h={10} color="gray.400" mb={4} />
            <Text fontSize="lg" fontWeight="medium" mb={2}>Student Resume</Text>
            <Text color="gray.500" fontSize="sm" mb={6}>View or download the latest resume.</Text>
            <HStack justify="center" spacing={4}>
                <Button colorScheme="blue" leftIcon={<FaDownload />}>Download PDF</Button>
                <Button variant="outline" leftIcon={<FaEye />}>Preview</Button>
            </HStack>
        </Box>
    </SectionContainer>
);

// --- Main Component ---

const StudentDetails = () => {
  const { usn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { user } = useAuth();
  const isAlumni = user?.role === 'alumni';
  const isCompany = user?.role === 'company';
  
  let Layout;
  if (isAlumni) Layout = AlumniLayout;
  else if (isCompany) Layout = CompanyLayout;
  else Layout = AdminLayout;
 
  const [activeSection, setActiveSection] = useState((isAlumni || isCompany) ? 'career' : 'dashboard');
  const [student, setStudent] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const completionPercentage = fullProfile ? calculateProfileCompletion(fullProfile) : 0;
  const showNotification = completionPercentage < 100 && fullProfile;

  useEffect(() => {
    fetchStudentData();
    if (isCompany && user) {
        checkFavoriteStatus();
    }
  }, [usn, user, isCompany]);

  const checkFavoriteStatus = async () => {
      try {
        const isFav = await PlacementService.isCompanyStudentFavorite(user.id, usn);
        setIsFavorited(isFav);
      } catch (error) {
          console.error("Error checking favorite status", error);
      }
  }

  const handleToggleFavorite = async () => {
      try {
        const res = await PlacementService.toggleCompanyStudentFavorite(user.id, usn);
        if (res.success) {
            setIsFavorited(res.isFavorited);
            toast({
                title: res.isFavorited ? "Added to Favorites" : "Removed from Favorites",
                status: "success",
                duration: 2000,
                isClosable: true
            });
        }
      } catch (error) {
          toast({
              title: "Error updating favorite",
              status: "error",
              duration: 2000
          });
      }
  }

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Student Full Profile
      const profile = await StudentProfileService.getFullProfile(usn);
      
      if (profile) {
          const transformedStudent = {
              fullName: `${profile.personal?.first_name || ''} ${profile.personal?.last_name || ''}`.trim() || 'N/A',
              usn: usn,
              gender: profile.personal?.gender || 'N/A',
              dateOfBirth: profile.personal?.dob ? new Date(profile.personal.dob).toLocaleDateString() : 'N/A',
              programId: profile.personal?.program_id || 'N/A',
              specializationId: profile.personal?.specialization_id || 'N/A',
              collegeEmail: profile.contact?.college_email || 'N/A',
              personalEmail: profile.contact?.personal_email || 'N/A',
              phoneNumber: profile.contact?.mobile_number || 'N/A',
              phoneCountryCode: "+91",
              links: {
                  linkedin: profile.contact?.linkedin_url,
                  github: profile.contact?.github_url,
                  portfolio: profile.contact?.portfolio_url
              },
              education: profile.education || [],
              projects: profile.projects || [],
              internships: profile.internships || [],
              certifications: profile.certifications || [],
              publications: profile.publications || [],
              academics: profile.academics || [],
              trainings: profile.trainings || [],
              extraCurricular: profile.extraCurricular || [],
              otherExperiences: profile.otherExperiences || [],
              parents: profile.parents || []
          };
          setStudent(transformedStudent);
      } else {
          setStudent({ usn: usn });
      }

      // 2. Fetch Applications (Still using PlacementService as it handles process logic, even if empty now)
      try {
          const processData = await PlacementService.getStudentProcess(usn);
          setApplications(processData || []);
      } catch (err) {
          console.error("Error fetching applications:", err);
          setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setStudent({ usn: usn });
      setApplications([]);
      toast({ title: "Error loading data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
    { id: 'personal', label: 'Personal Information', icon: FaUser },
    { id: 'contact', label: 'Contact & Links', icon: FaAddressBook },
    { id: 'family', label: 'Parent / Guardian', icon: FaUsers },
    { id: 'career', label: 'Career Overview', icon: FaBriefcase },
    { id: 'education', label: 'Education', icon: FaGraduationCap },
    { id: 'academics', label: 'Academic Performance', icon: FaChartBar },
    { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
    { id: 'internships', label: 'Internships', icon: FaBriefcase },
    { id: 'trainings', label: 'Training & Workshops', icon: FaChalkboardTeacher },
    { id: 'certifications', label: 'Certifications', icon: FaCertificate },
    { id: 'publications', label: 'Publications', icon: FaBook },
    { id: 'extra', label: 'Extra-Curricular', icon: FaMedal },
    { id: 'other', label: 'Other Experiences', icon: FaList },
    { id: 'resume', label: 'Resume', icon: FaFileAlt },
  ];

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (isAlumni || isCompany) {
       return !['dashboard', 'personal', 'contact', 'family', 'resume'].includes(item.id);
    }
    return true;
  });

  const renderContent = () => {
    if (!fullProfile) return <Box p={6}><Text>No profile data available.</Text></Box>;

    const data = {
         ...fullProfile,
         personal: fullProfile.personal || {},
         communication: fullProfile.contact || {},
         parents: fullProfile.family || [],
         internships: fullProfile.internships || [],
         certifications: fullProfile.certifications || [],
         publications: fullProfile.publications || [],
         trainings: fullProfile.trainings || [],
         extraCurricular: fullProfile.extraCurricular || [],
         otherExperiences: fullProfile.otherExperiences || [],
         career: fullProfile.career || { keyExpertise: [] },
         education: fullProfile.education || [],
         academics: fullProfile.academics || [],
         projects: fullProfile.projects || []
     };

     switch (activeSection) {
       case 'dashboard':
         if (isAlumni || isCompany) return <Box p={6}><Text>Access Restricted</Text></Box>;
         return <DashboardView applications={applications} completionPercentage={completionPercentage} showNotification={showNotification} navigate={navigate} isReadOnly={isAlumni} />;
       case 'personal':
         if (isAlumni || isCompany) return <Box p={6}><Text>Access Restricted</Text></Box>;
         return <PersonalSection data={{...data.personal, usn: usn}} />;
       case 'contact':
         if (isAlumni || isCompany) return <Box p={6}><Text>Access Restricted</Text></Box>;
         return <ContactSection data={data.communication} />;
       case 'family':
         if (isAlumni || isCompany) return <Box p={6}><Text>Access Restricted</Text></Box>;
         return <FamilySection data={data.parents} />;
       case 'education':
         return <EducationSection data={data.education} />;
       case 'academics':
         return <AcademicsSection data={data.academics} />;
       case 'projects':
         return <ProjectsSection data={data.projects} />;
       case 'career':
          return (
              <SectionContainer title="Career Overview">
                  <Text mb={4}><b>Summary:</b> {data.career.briefSummary}</Text>
                  <Text mb={2}><b>Key Expertise:</b></Text>
                  <HStack flexWrap="wrap">{data.career.keyExpertise.map((s,i) => <Badge key={i} colorScheme="green">{s}</Badge>)}</HStack>
              </SectionContainer>
          );
       case 'internships':
          return <InternshipsSection data={data.internships} />;
       case 'trainings':
          return <TrainingsSection data={data.trainings} />;
       case 'certifications':
          return <CertificationsSection data={data.certifications} />;
       case 'publications':
          return <PublicationsSection data={data.publications} />;
       case 'extra':
          return <ExtraCurricularSection data={data.extraCurricular} />;
       case 'other':
          return <OtherExperiencesSection data={data.otherExperiences} />;
       case 'resume':
          return <ResumeSection />;
       default:
         return <Box p={6} bg="white" borderRadius="xl"><Text>Section under development.</Text></Box>;
     }
  };

  if (loading) {
    return (
      <Layout fullWidth>
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout fullWidth>
      <Box bg="#f4f6f8" minH="calc(100vh - 72px)">
        {/* Header with Back Button */}
        <Box bg="white" borderBottom="1px solid" borderColor="gray.200" px={8} py={4}>
             <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                    <Button 
                        leftIcon={<ArrowBackIcon />} 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => (isAlumni || isCompany) ? navigate(-1) : navigate('/placement/students')} 
                    >
                        Back
                    </Button>
                    <Box>
                        <Heading size="md" color="#20343c">{student?.name || "Student Dashboard"}</Heading>
                        <Text fontSize="sm" color="gray.500">USN: {student?.usn || usn}</Text>
                    </Box>
                </HStack>
                {isCompany && (
                    <Button 
                        leftIcon={isFavorited ? <StarIcon color="yellow.400" /> : <StarIcon />} 
                        colorScheme={isFavorited ? "yellow" : "gray"}
                        variant={isFavorited ? "solid" : "outline"}
                        size="sm"
                        onClick={handleToggleFavorite}
                    >
                        {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                )}
                {!isAlumni && !isCompany && (
                <Button bg="#20343c" color="white" _hover={{ bg: "#1a2b32" }} size="sm">
                    <FaBell style={{ marginRight: "8px" }} /> Notifications
                </Button>
                )}
            </Flex>
        </Box>

        <Container maxW="100%" px={0}>
            <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} minH="calc(100vh - 130px)">
                {/* Sidebar */}
                <Box bg="white" borderRight="1px solid" borderColor="gray.200" py={6} display={{ base: 'none', lg: 'block' }}>
                    <VStack align="stretch" spacing={1} px={3}>
                        {filteredSidebarItems.map(item => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                justifyContent="flex-start"
                                leftIcon={<Icon as={item.icon} color={activeSection === item.id ? "#d4a960" : "gray.400"} />}
                                isActive={activeSection === item.id}
                                onClick={() => setActiveSection(item.id)}
                                _active={{ bg: '#f0f4f8', color: '#20343c', fontWeight: "bold" }}
                                _hover={{ bg: '#f7f9fa' }}
                                color="gray.600"
                                fontWeight="medium"
                                h="48px"
                                borderRadius="lg"
                            >
                                {item.label}
                            </Button>
                        ))}
                    </VStack>
                </Box>

                {/* Content */}
                <Box p={{ base: 4, lg: 8 }} overflowY="auto" maxH="calc(100vh - 130px)">
                    {renderContent()}
                </Box>
            </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default StudentDetails;
