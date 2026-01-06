import { Box, Button, Container, Heading, Input, Stack, Text, VStack, InputGroup, InputRightElement } from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Field } from "../components/ui/field"
import { useAuth } from "../context/AuthContext"
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import PixelCard from "../components/PixelCard"

export const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate("/placement/dashboard");
      } else if (user.role === 'alumni') {
        navigate("/placement/alumni-dashboard");
      } else if (user.role === 'company') {
        navigate("/company/dashboard");
      } else if (user.role === 'management') {
        navigate("/management/dashboard");
      } else if (user.role === 'dean') {
        navigate("/dean/dashboard");
      } else if (user.role === 'parent') {
        navigate("/parent/dashboard");
      } else {
        navigate("/student-dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    console.log("Logging in with:", { email, password })
    
    // Attempt login with AuthContext
    try {
      const result = await login(email, password);
      
      if (result && result.success) {
        const user = result.user;
        // Navigate based on role
        if (user.role === 'admin' || user.role === 'superadmin') {
          navigate("/placement/dashboard");
        } else if (user.role === 'alumni') {
          navigate("/placement/alumni-dashboard");
        } else if (user.role === 'company') {
          navigate("/company/dashboard");
        } else if (user.role === 'management') {
          navigate("/management/dashboard");
        } else if (user.role === 'dean') {
          navigate("/dean/dashboard");
        } else if (user.role === 'parent') {
          navigate("/parent/dashboard");
        } else {
          navigate("/student-dashboard", { state: { isFirstLogin: true } });
        }
      } else {
        alert(result?.message || "Invalid Credentials. Please check your ID/Email and Password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  }

  return (
    <Box py={20} bg="gray.50" minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="sm" bg="white" p={8} borderRadius="xl" shadow="lg" borderTopWidth="4px" borderTopColor="#20343c">
        <VStack gap={6} align="stretch">
          <Heading textAlign="center" color="#20343c">Login</Heading>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <Stack gap={4}>
            <Field label="Email">
              <Input 
                type="email"
                placeholder="Enter your Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }}
                color="gray.700"
                _placeholder={{ color: 'gray.500' }}
              />
            </Field>
            <Field label="Password">
              <InputGroup>
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }}
                  color="gray.700"
                  _placeholder={{ color: 'gray.500' }}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                  >
                    {showPassword ? <ViewIcon color="gray.500" /> : <ViewOffIcon color="gray.500" />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Field>

            <Box textAlign="right" width="full">
              <RouterLink to="/placement/forgot-password" style={{ color: "#d4a960", fontSize: "0.875rem", fontWeight: "500" }}>
                Forgot Password?
              </RouterLink>
            </Box>

            <PixelCard 
              variant="yellow" 
              onClick={handleLogin}
              style={{ 
                backgroundColor: "#20343c", 
                color: "white", 
                width: "100%", 
                height: "48px", 
                borderRadius: "0.375rem",
                fontWeight: "600",
                fontSize: "1rem"
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleLogin();
                }
              }}
            >
              Login
            </PixelCard>
          </Stack>
          </form>

          <Text textAlign="center" fontSize="sm" color="gray.600">
            Don&apos;t have an account?{" "}
            <RouterLink to="/register" style={{ color: "#d4a960", fontWeight: "bold" }}>
              Register here
            </RouterLink>
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
