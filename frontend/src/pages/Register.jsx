import { useState, useEffect } from "react"
import { 
  Box, Container, VStack, Heading, Input, Button, Text, 
  Flex, SimpleGrid, Textarea
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { 
  FaArrowLeft, FaArrowRight, FaCheck, 
  FaUserGraduate, FaBuilding, FaUserTie, FaChalkboardTeacher
} from "react-icons/fa"
import { Field } from "../components/ui/field"
import { RoleCard } from "../components/RoleCard"
import { useAuth } from "../context/AuthContext"

// Helper Icon component wrapper
const Icon = ({ as, ...props }) => <Box as={as} {...props} />

const StudentRegister = () => {
  const [step, setStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1: USN & Name
    usn: "",
    name: "", // Auto-filled
    
    // Step 2: Academic Details
    school: "",
    program: "",
    major: "",
    minor: "",
    specialization: "",
    
    // Step 3: Personal Details
    dob: "",
    gender: "",
    email: "",
    rvuEmail: "",
    contact: "",
    
    // Step 4: Parent Details
    fatherName: "",
    fatherContact: "",
    fatherOccupation: "",
    motherName: "",
    motherContact: "",
    motherOccupation: "",
    
    // Step 5: Password
    password: "",
    confirmPassword: ""
  })
  
  const [siblings] = useState([])
  const [error, setError] = useState("")
  const [isUsnVerified, setIsUsnVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [maskedEmail, setMaskedEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
    if (e.target.name === "usn") {
        setIsUsnVerified(false)
        setOtpSent(false)
    }
  }

  const handleVerifyUsn = async () => {
    if (!formData.usn) {
      setError("Please enter a USN");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-usn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usn: formData.usn.toUpperCase() })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isRegistered) {
           setError("Student already registered. Please login.");
           setIsUsnVerified(false);
        } else {
           setFormData({ ...formData, name: data.name || "", email: data.email });
           
           // Mask email for display
           if (data.email) {
               const [local, domain] = data.email.split('@');
               const masked = `${local[0]}***${local[local.length-1]}@${domain}`;
               setMaskedEmail(masked);
           } else {
               setMaskedEmail("Email not found");
           }
           
           setIsUsnVerified(true);
        }
      } else {
        setError(data.error || "USN not found in database. Please contact administration.");
        setIsUsnVerified(false);
      }
    } catch (e) {
      setError("Connection error. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSendOtp = () => {
    setOtpSent(true)
    alert(`OTP sent to ${formData.email}: 123456`) // Demo OTP
  }

  const verifyOtpAndContinue = () => {
    if (otp === "123456") { // Demo validation
      setError("")
      setStep(2)
    } else {
      setError("Invalid OTP. Please try again.")
    }
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    console.log("Full Registration Data:", { ...formData, siblings })
    setIsCompleted(true)
  }

  const inputStyle = {
    color: "gray.700",
    bg: "white",
    borderColor: "gray.300",
    _focus: { borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960", color: "gray.700", bg: "white" },
    _placeholder: { color: "gray.500" },
    _hover: { borderColor: "gray.400" },
    _autofill: { boxShadow: "0 0 0px 1000px white inset", textFillColor: "#2d3748" }
  }

  const renderStep1 = () => (
    <VStack gap={6} align="stretch">
      <Heading size="md" color="#20343c">Step 1: Student Verification</Heading>
      <Text color="gray.600">Please enter your University Serial Number (USN) to verify your identity.</Text>
      
      <Field label="USN" errorText={!isUsnVerified ? error : null}>
        <Input 
          name="usn" 
          placeholder="e.g., 1MS21CS001" 
          value={formData.usn} 
          onChange={handleChange}
          {...inputStyle}
          color="gray.700"
          readOnly={isUsnVerified}
          opacity={isUsnVerified ? 0.8 : 1}
        />
      </Field>

      {isUsnVerified && (
        <VStack gap={4} align="stretch" animation="fadeIn 0.5s">
            <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                <Text fontWeight="bold" color="#20343c">Student Details Found:</Text>
                <SimpleGrid columns={2} gap={4} mt={2}>
                    <Box>
                        <Text fontSize="xs" color="gray.500">Name</Text>
                        <Text fontWeight="medium" color="gray.700">{formData.name}</Text>
                    </Box>
                    <Box>
                        <Text fontSize="xs" color="gray.500">Registered Email</Text>
                        <Text fontWeight="medium" color="gray.700">{maskedEmail}</Text>
                    </Box>
                </SimpleGrid>
            </Box>

            {!otpSent ? (
                 <Button bg="#20343c" color="white" width="full" _hover={{ bg: "#1a2b32" }} onClick={handleSendOtp}>
                    Send OTP <Icon as={FaArrowRight} ml={2} />
                </Button>
            ) : (
                <VStack gap={4} align="stretch">
                    <Text fontSize="sm" color="green.600" bg="green.50" p={2} borderRadius="md" border="1px solid" borderColor="green.200">
                        <Icon as={FaCheck} display="inline" mr={2} />
                        OTP sent successfully
                    </Text>
                    
                    <Field label="Enter OTP" errorText={error}>
                        <Input 
                            placeholder="Enter 6-digit OTP" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)}
                            {...inputStyle}
                            color="gray.700"
                            maxLength={6}
                            textAlign="center"
                            letterSpacing="widest"
                            fontWeight="bold"
                        />
                    </Field>

                    <Button bg="#20343c" color="white" width="full" _hover={{ bg: "#1a2b32" }} onClick={verifyOtpAndContinue}>
                        Verify & Continue <Icon as={FaArrowRight} ml={2} />
                    </Button>
                </VStack>
            )}

             <Button variant="link" size="sm" color="gray.500" onClick={() => { setIsUsnVerified(false); setOtpSent(false); setOtp(""); setError(""); }}>
                Not you? Change USN
            </Button>
        </VStack>
      )}

      {!isUsnVerified && (
        <Button 
            bg="#20343c" 
            color="white" 
            width="full" 
            _hover={{ bg: "#1a2b32" }} 
            onClick={handleVerifyUsn}
            isLoading={loading}
            loadingText="Verifying..."
        >
            Get Details <Icon as={FaArrowRight} ml={2} />
        </Button>
      )}
    </VStack>
  )

  const renderStep2 = () => (
    <VStack gap={4} align="stretch">
      <Heading size="md" color="#20343c">Step 2: Academic Details</Heading>
      <Text color="#20343c" fontWeight="bold">Welcome, {formData.name}</Text>
      
      <Field label="School">
        <Input name="school" placeholder="e.g. School of Engineering" value={formData.school} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>
      
      <Field label="Program">
        <Input name="program" placeholder="e.g. B.Tech" value={formData.program} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>
      
      <Flex gap={4}>
        <Field label="Major">
          <Input name="major" placeholder="e.g. Computer Science" value={formData.major} onChange={handleChange} {...inputStyle} color="gray.700" />
        </Field>
        <Field label="Minor">
          <Input name="minor" placeholder="Optional" value={formData.minor} onChange={handleChange} {...inputStyle} color="gray.700" />
        </Field>
      </Flex>
      
      <Field label="Specialization">
        <Input name="specialization" placeholder="e.g. AI/ML" value={formData.specialization} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>

      <Flex gap={4} mt={4}>
        <Button variant="outline" onClick={handleBack} borderColor="#20343c" color="#20343c" _hover={{ bg: "gray.50" }}>Back</Button>
        <Button bg="#20343c" color="white" flex={1} _hover={{ bg: "#1a2b32" }} onClick={handleNext}>Next</Button>
      </Flex>
    </VStack>
  )

  const renderStep3 = () => (
    <VStack gap={4} align="stretch">
      <Heading size="md" color="#20343c">Step 3: Personal Details</Heading>
      
      <Flex gap={4}>
        <Field label="Date of Birth">
          <Input type="date" name="dob" value={formData.dob} onChange={handleChange} {...inputStyle} color="gray.700" />
        </Field>
        <Field label="Gender">
          <Box 
            as="select" 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange} 
            {...inputStyle} 
            color="gray.700"
            h={10}
            w="full"
            borderRadius="md"
            px={3}
            border="1px solid"
            borderColor="gray.300"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Box>
        </Field>
      </Flex>
      
      <Field label="Personal Email ID">
        <Input type="email" name="email" placeholder="e.g. john.doe@gmail.com" value={formData.email} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>
      
      <Field label="RVU Email ID">
        <Input type="email" name="rvuEmail" placeholder="e.g. john.doe@rvu.edu.in" value={formData.rvuEmail} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>
      
      <Field label="Contact Number">
        <Input type="tel" name="contact" placeholder="e.g. 9876543210" value={formData.contact} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>

      <Flex gap={4} mt={4}>
        <Button variant="outline" onClick={handleBack} borderColor="#20343c" color="#20343c" _hover={{ bg: "gray.50" }}>Back</Button>
        <Button bg="#20343c" color="white" flex={1} _hover={{ bg: "#1a2b32" }} onClick={handleNext}>Next</Button>
      </Flex>
    </VStack>
  )

  const renderStep4 = () => (
    <VStack gap={4} align="stretch">
      <Heading size="md" color="#20343c">Step 4: Family Details</Heading>
      
      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
        <Text fontWeight="bold" mb={3} color="#20343c">Father&apos;s Details</Text>
        <VStack gap={3}>
          <Field label="Name">
            <Input name="fatherName" placeholder="Name" value={formData.fatherName} onChange={handleChange} {...inputStyle} color="gray.700" />
          </Field>
          <Flex gap={3} width="full">
            <Field label="Contact">
              <Input name="fatherContact" placeholder="Contact" value={formData.fatherContact} onChange={handleChange} {...inputStyle} color="gray.700" />
            </Field>
            <Field label="Occupation">
              <Input name="fatherOccupation" placeholder="Occupation" value={formData.fatherOccupation} onChange={handleChange} {...inputStyle} color="gray.700" />
            </Field>
          </Flex>
        </VStack>
      </Box>

      <Box p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
        <Text fontWeight="bold" mb={3} color="#20343c">Mother&apos;s Details</Text>
        <VStack gap={3}>
          <Field label="Name">
            <Input name="motherName" placeholder="Name" value={formData.motherName} onChange={handleChange} {...inputStyle} color="gray.700" />
          </Field>
          <Flex gap={3} width="full">
            <Field label="Contact">
              <Input name="motherContact" placeholder="Contact" value={formData.motherContact} onChange={handleChange} {...inputStyle} color="gray.700" />
            </Field>
            <Field label="Occupation">
              <Input name="motherOccupation" placeholder="Occupation" value={formData.motherOccupation} onChange={handleChange} {...inputStyle} color="gray.700" />
            </Field>
          </Flex>
        </VStack>
      </Box>

      <Flex gap={4} mt={4}>
        <Button variant="outline" onClick={handleBack} borderColor="#20343c" color="#20343c" _hover={{ bg: "gray.50" }}>Back</Button>
        <Button bg="#20343c" color="white" flex={1} _hover={{ bg: "#1a2b32" }} onClick={handleNext}>Next</Button>
      </Flex>
    </VStack>
  )

  const renderStep5 = () => (
    <VStack gap={6} align="stretch">
      <Heading size="md" color="#20343c">Step 5: Set Password</Heading>
      
      <Field label="Password" errorText={error && error.includes("Password") ? error : null}>
        <Input type="password" name="password" value={formData.password} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>
      
      <Field label="Confirm Password" errorText={error && error.includes("Password") ? error : null}>
        <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} {...inputStyle} color="gray.700" />
      </Field>

      <Flex gap={4} mt={4}>
        <Button variant="outline" onClick={handleBack} borderColor="#20343c" color="#20343c" _hover={{ bg: "gray.50" }}>Back</Button>
        <Button bg="#20343c" color="white" flex={1} _hover={{ bg: "#1a2b32" }} onClick={handleSubmit}>
          Complete Registration <Icon as={FaCheck} ml={2} />
        </Button>
      </Flex>
    </VStack>
  )

  return (
    <VStack gap={6} align="stretch">
      <Box textAlign="center" mb={4}>
        <Heading color="#20343c">Student Registration</Heading>
        {!isCompleted && (
          <Flex justify="center" gap={2} mt={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box 
                key={i} 
                w={3} h={3} 
                borderRadius="full" 
                bg={step >= i ? "#d4a960" : "gray.200"} 
                transition="all 0.3s"
              />
            ))}
          </Flex>
        )}
      </Box>
      
      {isCompleted ? (
        <VStack gap={6} py={10}>
          <Box bg="#d4a960" p={4} borderRadius="full" color="white">
            <Icon as={FaCheck} w={10} h={10} />
          </Box>
          <Heading size="lg" color="#20343c">Registration Complete!</Heading>
          <Text textAlign="center" color="gray.600">
            Your account has been successfully created. You can now login to access the placement portal.
          </Text>
          <Button as={RouterLink} to="/login" bg="#20343c" color="white" width="full" _hover={{ bg: "#1a2b32" }}>
            Proceed to Login
          </Button>
        </VStack>
      ) : (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </>
      )}
      
      {!isCompleted && step === 1 && (
        <Text textAlign="center" fontSize="sm" color="gray.600">
          Already have an account?{" "}
          <RouterLink to="/login" style={{ color: "#d4a960", fontWeight: "bold" }}>
            Login here
          </RouterLink>
        </Text>
      )}
    </VStack>
  )
}

const CompanyRegister = () => {
    const [formData, setFormData] = useState({
        company_name: "",
        hr_email: "",
        company_type: "",
        website: "",
        linkedin: "",
        address: "",
        description: "",
        company_logo_link: "",
        contact_phone: "",
        contact_role: ""
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        console.log("Company Registration Data:", formData)
        alert("Company Registration Submitted (Check Console)")
    }

    return (
        <VStack gap={6} align="stretch" py={4}>
            <Heading size="md" color="#20343c">Company Registration</Heading>
            <Text color="gray.600">Register your company to hire top talent.</Text>
            
            <Field label="Company Name" required>
                <Input 
                    name="company_name" 
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Enter company name" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

             <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Company Type">
                    <Input 
                        name="company_type" 
                        value={formData.company_type}
                        onChange={handleChange}
                        placeholder="e.g. Product, Service, Startup" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="HR Email" required>
                    <Input 
                        name="hr_email" 
                        value={formData.hr_email}
                        onChange={handleChange}
                        placeholder="Enter HR email" 
                        type="email" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Contact Number" required>
                    <Input 
                        name="contact_phone" 
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210" 
                        type="tel" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="Role / Designation" required>
                    <Input 
                        name="contact_role" 
                        value={formData.contact_role}
                        onChange={handleChange}
                        placeholder="e.g. HR Manager" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Website">
                    <Input 
                        name="website" 
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://company.com" 
                        type="url" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="LinkedIn">
                    <Input 
                        name="linkedin" 
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/company/..." 
                        type="url" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <Field label="Logo URL">
                <Input 
                    name="company_logo_link" 
                    value={formData.company_logo_link}
                    onChange={handleChange}
                    placeholder="https://company.com/logo.png" 
                    type="url" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <Field label="Address">
                <Textarea 
                    name="address" 
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Headquarters Address" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <Field label="Description">
                <Textarea 
                    name="description" 
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description about the company..." 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <Button 
                onClick={handleSubmit}
                bg="#20343c" 
                color="white" 
                width="full" 
                _hover={{ bg: "#1a2b32" }}
            >
                Register Company
            </Button>
        </VStack>
    )
}

const AlumniRegister = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        usn: "",
        graduation_year: "",
        phone_number: "",
        personal_email: "",
        current_company: "",
        current_designation: "",
        current_work_location: "",
        linkedin: ""
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        console.log("Alumni Registration Data:", formData)
        alert("Registration Submitted (Check Console)")
    }

    return (
        <VStack gap={6} align="stretch" py={4}>
            <Heading size="md" color="#20343c">Alumni Registration</Heading>
            <Text color="gray.600">Join the alumni network.</Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Full Name" required>
                    <Input 
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="John Doe" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="USN" required>
                    <Input 
                        name="usn"
                        value={formData.usn}
                        onChange={handleChange}
                        placeholder="1RVU19CSE001" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field label="Graduation Year" required>
                    <Input 
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={handleChange}
                        type="number" 
                        placeholder="e.g. 2023" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="Phone Number" required>
                    <Input 
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        type="tel" 
                        placeholder="+91 9876543210" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <Field label="Personal Email" required>
                <Input 
                    name="personal_email"
                    value={formData.personal_email}
                    onChange={handleChange}
                    type="email" 
                    placeholder="john.doe@gmail.com" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Current Company" required>
                    <Input 
                        name="current_company"
                        value={formData.current_company}
                        onChange={handleChange}
                        placeholder="Google" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
                <Field label="Current Designation" required>
                    <Input 
                        name="current_designation"
                        value={formData.current_designation}
                        onChange={handleChange}
                        placeholder="Software Engineer" 
                        color="gray.700" 
                        borderColor="gray.300" 
                        _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                    />
                </Field>
            </SimpleGrid>

            <Field label="Current Work Location">
                <Input 
                    name="current_work_location"
                    value={formData.current_work_location}
                    onChange={handleChange}
                    placeholder="Bangalore, India" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <Field label="LinkedIn Profile">
                <Input 
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    type="url" 
                    placeholder="https://linkedin.com/in/johndoe" 
                    color="gray.700" 
                    borderColor="gray.300" 
                    _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} 
                />
            </Field>

            <Button 
                onClick={handleSubmit}
                bg="#20343c" 
                color="white" 
                width="full" 
                _hover={{ bg: "#1a2b32" }}
            >
                Register as Alumni
            </Button>
        </VStack>
    )
}

const VerifierRegister = () => (
     <VStack gap={6} align="stretch" py={4}>
        <Heading size="md" color="#20343c">Verifier Access</Heading>
        <Text color="gray.600">Placement Officer / Admin Access.</Text>
        <Field label="Employee ID">
            <Input placeholder="Enter Employee ID" color="gray.700" borderColor="gray.300" _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} />
        </Field>
         <Field label="Access Code">
            <Input type="password" placeholder="Enter Access Code" color="gray.700" borderColor="gray.300" _focus={{ borderColor: "#d4a960", boxShadow: "0 0 0 1px #d4a960" }} />
        </Field>
        <Button bg="#20343c" color="white" width="full" _hover={{ bg: "#1a2b32" }}>
            Request Access
        </Button>
    </VStack>
)

export const Register = () => {
  const [role, setRole] = useState(null)
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role?.toLowerCase()) {
        case 'student':
          navigate("/student-dashboard", { replace: true });
          break;
        case 'admin':
        case 'superadmin':
          navigate("/placement/dashboard", { replace: true });
          break;
        case 'alumni':
          navigate("/placement/alumni-dashboard", { replace: true });
          break;
        case 'dean':
          navigate("/dean/dashboard", { replace: true });
          break;
        case 'company':
          navigate("/company/dashboard", { replace: true });
          break;
        case 'parent':
          navigate("/parent/dashboard", { replace: true });
          break;
        case 'management':
          navigate("/management/dashboard", { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Box py={10} bg="gray.50" minH="90vh" display="flex" alignItems="center" justifyContent="center">
      <Container maxW={role ? "md" : "lg"} bg="white" p={8} borderRadius="xl" shadow="lg" borderTopWidth="4px" borderTopColor="#20343c">
        {!role ? (
            <VStack gap={6} py={4}>
                <VStack gap={2}>
                    <Heading color="#20343c" textAlign="center" size="md">Join Our Platform</Heading>
                    <Text color="gray.500" textAlign="center" fontSize="sm">Select your role to continue</Text>
                </VStack>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} w="full">
                    <RoleCard title="Student" icon={FaUserGraduate} onClick={() => setRole('student')} />
                    <RoleCard title="Company" icon={FaBuilding} onClick={() => setRole('company')} />
                    <RoleCard title="Alumni" icon={FaUserTie} onClick={() => setRole('alumni')} />
                    <RoleCard title="Placement Team" icon={FaChalkboardTeacher} onClick={() => setRole('verifier')} />
                </SimpleGrid>
                <Text textAlign="center" fontSize="sm" color="gray.600">
                    Already have an account?{" "}
                    <RouterLink to="/login" style={{ color: "#d4a960", fontWeight: "bold" }}>
                        Login here
                    </RouterLink>
                </Text>
            </VStack>
        ) : (
             <VStack align="stretch" gap={4}>
                <Button 
                    variant="ghost" 
                    justifyContent="flex-start" 
                    leftIcon={<Icon as={FaArrowLeft} />} 
                    onClick={() => setRole(null)}
                    color="gray.500"
                    size="sm"
                >
                    Back to Role Selection
                </Button>
                {role === 'student' && <StudentRegister />}
                {role === 'company' && <CompanyRegister />}
                {role === 'alumni' && <AlumniRegister />}
                {role === 'verifier' && <VerifierRegister />}
             </VStack>
        )}
      </Container>
    </Box>
  )
}
