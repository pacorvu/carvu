import React from "react";
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";

export const PersonalInformationForm = ({ data = {}, onUpdate, isEditing }) => {
  const bg = useColorModeValue("white", "gray.700");
  const formData = data || {};

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <VStack spacing={6} align="stretch" bg={bg} p={6} borderRadius="lg" boxShadow="sm">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel>Full Name</FormLabel>
          <Input
            value={formData.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>USN</FormLabel>
          <Input
            value={formData.usn || ""}
            onChange={(e) => handleChange("usn", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email (College)</FormLabel>
          <Input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email (Personal)</FormLabel>
          <Input
            type="email"
            value={formData.personalEmail || ""}
            onChange={(e) => handleChange("personalEmail", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Mobile Number</FormLabel>
          <Input
            type="tel"
            value={formData.mobile || ""}
            onChange={(e) => handleChange("mobile", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Select
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
            value={formData.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            value={formData.dob || ""}
            onChange={(e) => handleChange("dob", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Blood Group</FormLabel>
          <Select
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
            value={formData.bloodGroup || ""}
            onChange={(e) => handleChange("bloodGroup", e.target.value)}
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Mother Tongue</FormLabel>
          <Input
            value={formData.motherTongue || ""}
            onChange={(e) => handleChange("motherTongue", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Caste</FormLabel>
          <Input
            value={formData.caste || ""}
            onChange={(e) => handleChange("caste", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Religion</FormLabel>
          <Input
            value={formData.religion || ""}
            onChange={(e) => handleChange("religion", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Nationality</FormLabel>
          <Input
            value={formData.nationality || ""}
            onChange={(e) => handleChange("nationality", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Aadhar Number</FormLabel>
          <Input
            value={formData.aadhar || ""}
            onChange={(e) => handleChange("aadhar", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>PAN Number</FormLabel>
          <Input
            value={formData.pan || ""}
            onChange={(e) => handleChange("pan", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};
