import { Box, Flex, Button, Heading, Spacer, HStack, Link, Image } from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const NavLink = ({ to, children }) => (
  <Link 
    as={RouterLink} 
    to={to} 
    color="white" 
    _hover={{ color: "#d4a960", textDecoration: "none" }}
    fontWeight="medium"
  >
    {children}
  </Link>
)

export const Navbar = () => {
  const { isAuthenticated, logout, userRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <Box as="nav" bg="#20343c" color="white" py={4} px={8} position="sticky" top={0} zIndex={100} shadow="md">
      <Box position="relative" maxW="container.xl" mx="auto">
        <Box
          as={RouterLink}
          to="/"
          position="absolute"
          top="65%"
          left={-20}
          transform="translateY(-50%)"
        >
          <Image
            src="/logo.png"
            alt="CARVu logo"
            w="220px"
            objectFit="contain"
          />
        </Box>
        <Flex alignItems="center">
          <HStack spacing={3} _hover={{ textDecoration: "none" }} />
          <Spacer />
          <Flex gap={6} alignItems="center">
            <NavLink to="/">Home</NavLink>
            {!isAuthenticated ? (
              <>
                <NavLink to="/about">About</NavLink>
                <NavLink to="#">Companies</NavLink>
                <NavLink to="#">Contact</NavLink>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="outline"
                  borderColor="#d4a960"
                  color="#d4a960"
                  _hover={{ bg: "#d4a960", color: "#20343c" }}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                {userRole?.toLowerCase() === "student" && (
                  <>
                    <NavLink to="/student-dashboard">Dashboard</NavLink>
                    <NavLink to="#">Ongoing Drives</NavLink>
                    <NavLink to="#">Applied Jobs</NavLink>
                  </>
                )}
                <HStack gap={4}>
                  <Button
                    as={RouterLink}
                    to="/student/profile"
                    variant="ghost"
                    color="white"
                    _hover={{ color: "#d4a960" }}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="outline"
                    borderColor="#d4a960"
                    color="#d4a960"
                    _hover={{ bg: "#d4a960", color: "#20343c" }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </HStack>
              </>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
