import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Select
} from '@chakra-ui/react';
import AdminLayout from '../../components/AdminLayout';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
        // Mock register
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/placement/users');
    } catch (err) {
        setError('Failed to create user');
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
                    Add New User
                </Heading>

                {error && (
                    <Box mb={4} p={3} bg="red.100" color="red.700" borderRadius="md">
                        {error}
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={fieldErrors.name}>
                            <FormLabel>Name</FormLabel>
                            <Input name="name" value={formData.name} onChange={handleChange} />
                            <FormErrorMessage>{fieldErrors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={fieldErrors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input name="email" value={formData.email} onChange={handleChange} />
                            <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={fieldErrors.password}>
                            <FormLabel>Password</FormLabel>
                            <Input type="password" name="password" value={formData.password} onChange={handleChange} />
                            <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={fieldErrors.confirmPassword}>
                            <FormLabel>Confirm Password</FormLabel>
                            <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                            <FormErrorMessage>{fieldErrors.confirmPassword}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select name="role" value={formData.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </Select>
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
                            Create User
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
            </Box>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default Register;
