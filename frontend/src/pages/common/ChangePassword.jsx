import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  Text,
  VStack,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/react';
import AdminLayout from '../../components/AdminLayout';

const ChangePassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setFetching(true);
      // Mock fetch user
      await new Promise(resolve => setTimeout(resolve, 500));
      // Dummy user data
      const mockUser = {
         id: id,
         name: id === '1' ? 'Placement Officer' : 'Demo Student',
         email: id === '1' ? 'admin@rvu.edu.in' : 'student@rvu.edu.in'
      };
      setUser(mockUser);
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Mock update password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        navigate('/placement/users');
      }, 2000);
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Box
        w="100%"
        minH="calc(100vh - 72px)"
        bg="#172e36"
        py={8}
        px={4}
      >
        <Container maxW="lg">
          <Box
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="2xl"
            p={8}
            border="1px solid"
            borderColor={borderColor}
          >
            <Heading size="lg" mb={6} color="#d1a85d" textAlign="center">
              Change Password
            </Heading>

            {fetching ? (
               <Text color="white" textAlign="center">Loading user...</Text>
            ) : (
              <>
                {user && (
                  <Text color="gray.500" mb={6} textAlign="center">
                    For user: {user.name} ({user.email})
                  </Text>
                )}

                {error && (
                  <Box mb={4} p={3} bg="red.100" color="red.700" borderRadius="md">
                    {error}
                  </Box>
                )}

                {success && (
                  <Box mb={4} p={3} bg="green.100" color="green.700" borderRadius="md">
                    {success}
                  </Box>
                )}

                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isInvalid={fieldErrors.password}>
                      <FormLabel>New Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={fieldErrors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <FormErrorMessage>{fieldErrors.confirmPassword}</FormErrorMessage>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="yellow"
                      width="full"
                      bg="#d1a85d"
                      color="white"
                      _hover={{ bg: '#c19a4d' }}
                      isLoading={loading}
                      mt={4}
                    >
                      Update Password
                    </Button>
                    
                    <Button
                        variant="ghost"
                        width="full"
                        onClick={() => navigate('/placement/users')}
                    >
                        Cancel
                    </Button>
                  </VStack>
                </form>
              </>
            )}
          </Box>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default ChangePassword;
