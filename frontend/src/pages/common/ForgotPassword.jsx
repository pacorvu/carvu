import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Input,
  VStack,
  Heading,
  Text,
  Button,
  Stack,
  Icon
} from '@chakra-ui/react';
import { Field } from '../../components/ui/field';
import PixelCard from '../../components/PixelCard';
import { FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtp = () => {
    const errors = {};
    if (!otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswords = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateEmail()) return;

    setLoading(true);
    try {
      // Mock API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(`OTP sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateOtp()) return;

    setLoading(true);
    try {
      // Mock API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation logic (accept any 6 digit OTP for now)
      setSuccess('OTP Verified successfully');
      setStep(3);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePasswords()) return;

    setLoading(true);
    try {
      // Mock API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Password reset successfully! You can now login.');
      setStep(4); // Success state
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = {
    _focus: { borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" },
    color: "gray.700",
    _placeholder: { color: 'gray.500' }
  };

  const buttonStyle = {
    backgroundColor: "#20343c",
    color: "white",
    width: "100%",
    height: "48px",
    borderRadius: "0.375rem",
    fontWeight: "600",
    fontSize: "1rem"
  };

  // Render Helpers
  const renderStep1 = () => (
    <Stack gap={4}>
      <Field label="Email Address" invalid={!!fieldErrors.email} errorText={fieldErrors.email}>
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors({ ...fieldErrors, email: '' });
          }}
          {...inputProps}
        />
      </Field>

      <PixelCard 
        variant="yellow"
        onClick={handleRequestOtp}
        isLoading={loading}
        style={buttonStyle}
        role="button"
        tabIndex={0}
      >
        {loading ? "Sending..." : "Send OTP"}
      </PixelCard>
    </Stack>
  );

  const renderStep2 = () => (
    <Stack gap={4}>
      <Box textAlign="center" mb={2}>
        <Text fontSize="sm" color="gray.600">
            We've sent a 6-digit code to <Text as="span" fontWeight="bold" color="#20343c">{email}</Text>
        </Text>
      </Box>

      <Field label="Enter OTP" invalid={!!fieldErrors.otp} errorText={fieldErrors.otp}>
        <Input
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); // Only numbers, max 6
              setFieldErrors({ ...fieldErrors, otp: '' });
          }}
          textAlign="center"
          letterSpacing="widest"
          fontWeight="bold"
          fontSize="xl"
          maxLength={6}
          {...inputProps}
        />
      </Field>

      <PixelCard 
        variant="yellow"
        onClick={handleVerifyOtp}
        isLoading={loading}
        style={buttonStyle}
        role="button"
        tabIndex={0}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </PixelCard>

      <Button 
          variant="link" 
          size="sm" 
          color="gray.500" 
          onClick={() => setStep(1)}
          isDisabled={loading}
          fontWeight="normal"
      >
          Change Email
      </Button>
    </Stack>
  );

  const renderStep3 = () => (
    <Stack gap={4}>
      <Field label="New Password" invalid={!!fieldErrors.newPassword} errorText={fieldErrors.newPassword}>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => {
              setNewPassword(e.target.value);
              setFieldErrors({ ...fieldErrors, newPassword: '' });
          }}
          {...inputProps}
        />
      </Field>

      <Field label="Confirm Password" invalid={!!fieldErrors.confirmPassword} errorText={fieldErrors.confirmPassword}>
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors({ ...fieldErrors, confirmPassword: '' });
          }}
          {...inputProps}
        />
      </Field>

      <PixelCard 
        variant="yellow"
        onClick={handleResetPassword}
        isLoading={loading}
        style={buttonStyle}
        role="button"
        tabIndex={0}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </PixelCard>
    </Stack>
  );

  const renderStep4 = () => (
    <VStack spacing={6} py={4}>
        <Icon as={FaCheckCircle} boxSize={16} color="green.500" />
        <Box textAlign="center">
          <Heading size="md" color="#20343c" mb={2}>Password Reset!</Heading>
          <Text fontSize="sm" color="gray.600">
              Your password has been reset successfully.
              <br />You can now login with your new password.
          </Text>
        </Box>
        
        <Link to="/login" style={{ width: '100%' }}>
          <PixelCard 
            variant="yellow"
            as={RouterLink}
            to="/login"
            style={{
              ...buttonStyle,
              backgroundColor: "green.500", // Green for success action
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none"
            }}
          >
            Login Now
          </PixelCard>
        </Link>
    </VStack>
  );

  return (
    <Box py={20} bg="gray.50" minH="80vh" display="flex" alignItems="center" justifyContent="center">
      <Container 
        maxW="sm" 
        bg="white" 
        p={8} 
        borderRadius="xl" 
        shadow="lg" 
        borderTopWidth="4px" 
        borderTopColor="#20343c"
      >
        <VStack gap={6} align="stretch">
            {step !== 4 && (
                <Box textAlign="center">
                    <Heading size="lg" color="#20343c" mb={2}>
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Enter OTP'}
                        {step === 3 && 'Reset Password'}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                        {step === 1 && 'Enter your email to receive a verification code'}
                        {step === 2 && 'Enter the verification code sent to your email'}
                        {step === 3 && 'Create a new strong password'}
                    </Text>
                </Box>
            )}

            {error && (
                <Box p={3} bg="red.50" color="red.500" borderRadius="md" fontSize="sm" textAlign="center">
                    {error}
                </Box>
            )}

            {/* Steps Rendering */}
            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </form>
            
            {step === 4 && renderStep4()}

            {step !== 4 && (
                <Box textAlign="center">
                  <RouterLink to="/login">
                    <Text 
                      color="gray.600" 
                      fontSize="sm" 
                      display="inline-flex" 
                      alignItems="center"
                      _hover={{ color: '#d4a960' }}
                    >
                        <Icon as={FaArrowLeft} mr={2} /> Back to Login
                    </Text>
                  </RouterLink>
                </Box>
            )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
