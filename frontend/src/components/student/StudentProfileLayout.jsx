import { useState } from "react"
import { Box, Flex, VStack, Text, Icon, Heading, HStack, Image, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody, Badge, List, ListItem } from "@chakra-ui/react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import StudentUniversalSearch from "./StudentUniversalSearch"
import { useAuth } from "../../context/AuthContext"
import { 
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "../ui/drawer"
import { 
  FaChevronRight, 
  FaBars, 
  FaUser, 
  FaAddressBook, 
  FaGraduationCap, 
  FaPaperclip, 
  FaUsers, 
  FaBriefcase, 
  FaProjectDiagram, 
  FaBook, 
  FaChalkboardTeacher, 
  FaCertificate, 
  FaUserTie, 
  FaList, 
  FaChartBar, 
  FaVideo,
  FaFileAlt,
  FaMedal,
  FaBell
} from "react-icons/fa"

const navItems = [
  { label: "Personal Information", path: "/student/profile/personal", icon: FaUser },
  { label: "Contact & Links", path: "/student/profile/contact", icon: FaAddressBook },
  { label: "Parent / Guardian Details", path: "/student/profile/family", icon: FaUsers },
  { label: "Career Overview", path: "/student/profile/career", icon: FaBriefcase },
  { label: "Education", path: "/student/profile/education", icon: FaGraduationCap },
  { label: "Academic Performance", path: "/student/profile/academics", icon: FaChartBar },
  { label: "Projects", path: "/student/profile/projects", icon: FaProjectDiagram },
  { label: "Internships", path: "/student/profile/internships", icon: FaBriefcase },
  { label: "Training & Workshops", path: "/student/profile/trainings", icon: FaChalkboardTeacher },
  { label: "Certifications", path: "/student/profile/certifications", icon: FaCertificate },
  { label: "Publications", path: "/student/profile/publications", icon: FaBook },
  { label: "Extra-Curricular Activities", path: "/student/profile/extra-curricular", icon: FaMedal },
  { label: "Other Experiences", path: "/student/profile/other", icon: FaList },
  { label: "Resume", path: "/student/profile/resume", icon: FaFileAlt },
]

export const StudentProfileLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavContent = () => (
    <VStack align="stretch" gap={1} py={2}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.label === "Personal Information" && location.pathname === "/student/profile")
        
        return (
          <Link key={item.label} to={item.path}>
            <Box 
              px={6} 
              py={3} 
              mx={2}
              borderRadius="md"
              bg={isActive ? "#d4a960" : "transparent"} 
              color={isActive ? "#20343c" : "gray.600"}
              fontWeight={isActive ? "bold" : "medium"}
              display="flex"
              alignItems="center"
              gap={3}
              _hover={{ bg: isActive ? "#d4a960" : "#f0f4f8", color: "#20343c" }}
              cursor="pointer"
              transition="all 0.2s"
            >
              <Icon as={item.icon} boxSize={4} />
              <Text fontSize="sm" flex={1}>{item.label}</Text>
              {isActive && <Icon as={FaChevronRight} color="#20343c" boxSize={3} />}
            </Box>
          </Link>
        )
      })}
    </VStack>
  )

  const showSidebar = location.pathname.startsWith('/student/profile')

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Top Header */}
      <Flex 
        h="60px" 
        bg="#20343c" 
        borderBottom="1px solid" 
        borderColor="#2d4a54" 
        align="center" 
        justify="space-between"
        px={4} 
        position="sticky"
        top={0}
        zIndex={10}
      >
        {/* Left: Logo */}
        <HStack spacing={3} minW="fit-content">
          <Image src="/logo.png" alt="CarvU" h="32px" objectFit="contain" mt={-1} />
          <Heading size="md" color="white" mt={1} display={{ base: "none", md: "block" }}>Carv U</Heading>
        </HStack>
        
        {/* Right: Nav + Notifications + Search + Logout */}
        <HStack spacing={4} align="center">
          <HStack 
            spacing={4} 
            display={{ base: "none", md: "flex" }}
          >
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }}
              as={Link}
              to="/student-dashboard"
              size="sm"
              fontWeight="medium"
            >
              Dashboard
            </Button>
            <Button
              as={Link}
              to="/student/profile/personal"
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              size="sm"
              fontWeight="medium"
              bg={showSidebar ? "whiteAlpha.200" : "transparent"}
            >
              Profile
            </Button>
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }}
              as={Link}
              to="/student/placements/feed"
              size="sm"
              fontWeight="medium"
            >
              Placement Drives
            </Button>
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }}
              as={Link}
              to="/student/placements/offers"
              size="sm"
              fontWeight="medium"
            >
              Job Offers
            </Button>
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }}
              as={Link}
              to="/student/placements/events"
              size="sm"
              fontWeight="medium"
            >
              Events
            </Button>
            <Button 
              variant="ghost" 
              color="white" 
              _hover={{ bg: "whiteAlpha.200" }}
              as={Link}
              to="/student/placements/policy"
              size="sm"
              fontWeight="medium"
            >
              Policy
            </Button>
          </HStack>
          <Popover placement="bottom">
            <PopoverTrigger>
              <Button 
                variant="ghost" 
                color="white" 
                _hover={{ bg: "whiteAlpha.200" }}
                size="sm"
                aria-label="Notifications"
              >
                <Icon as={FaBell} />
              </Button>
            </PopoverTrigger>
            <PopoverContent color="gray.800" _focus={{ boxShadow: "xl" }}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="bold" borderBottomWidth="1px">Notifications</PopoverHeader>
              <PopoverBody p={0}>
                <List spacing={0}>
                  {[
                    "New placement drive added: Google",
                    "Resume verification pending",
                    "Upcoming session on Resume Building"
                  ].map((note, i) => (
                    <ListItem key={i} p={3} borderBottomWidth="1px" _last={{ borderBottomWidth: 0 }} _hover={{ bg: "gray.50" }}>
                      <HStack>
                        <Icon as={FaBell} color="#d4a960" />
                        <Text fontSize="sm">{note}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          {/* Search and Logout unchanged */}
          <HStack spacing={4}>
          <Box w="300px" display={{ base: "none", md: "block" }}>
            <StudentUniversalSearch />
          </Box>
          <Button 
            variant="ghost" 
            color="red.300" 
            _hover={{ bg: "whiteAlpha.200", color: "red.200" }}
            onClick={handleLogout}
            size="sm"
            fontWeight="medium"
            flexShrink={0}
          >
            Logout
          </Button>
          </HStack>
        </HStack>
      </Flex>

      <Flex>
        {/* Persistent Sidebar (only for profile pages) */}
        {showSidebar && (
          <Box 
            w="280px" 
            bg="white" 
            borderRight="1px solid" 
            borderColor="gray.200"
            h="calc(100vh - 60px)" 
            position="sticky" 
            top="60px"
            overflowY="auto"
            display={{ base: "none", md: "block" }}
            flexShrink={0}
          >
             <Box py={4}>
               <NavContent />
             </Box>
          </Box>
        )}

        {/* Mobile Sidebar Drawer (optional, still keeping it for mobile access if needed, but triggered differently? 
            Currently no mobile menu button for sidebar. 
            Maybe we should add one if we are on profile page on mobile.
            For now, following desktop instruction primarily.) 
        */}

        {/* Main Content */}
        <Box flex={1} p={8} maxW={showSidebar ? "calc(100% - 280px)" : "container.xl"} mx="auto">
           {children}
        </Box>
      </Flex>
    </Box>
  )
}
