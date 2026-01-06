import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  SimpleGrid,
  Box,
  Heading,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa";

export const CertificationsForm = ({ data = {}, onUpdate, isEditing }) => {
  const bg = useColorModeValue("white", "gray.700");
  const formData = data || {};

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  const handleAdd = () => {
    const newCertifications = [
      ...(formData.certifications || []),
      { name: "", organization: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" },
    ];
    handleChange("certifications", newCertifications);
  };

  const handleRemove = (index) => {
    const newCertifications = formData.certifications.filter((_, i) => i !== index);
    handleChange("certifications", newCertifications);
  };

  const handleCertificationChange = (index, field, value) => {
    const newCertifications = [...(formData.certifications || [])];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    handleChange("certifications", newCertifications);
  };

  return (
    <VStack spacing={6} align="stretch" bg={bg} p={6} borderRadius="lg" boxShadow="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">Certifications</Heading>
        {isEditing && (
          <Button
            leftIcon={<FaPlus />}
            onClick={handleAdd}
            variant="outline"
            colorScheme="orange"
            borderColor="#d4a960"
            color="#d4a960"
            _hover={{ bg: "#fff5e6" }}
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          >
            Add Certification
          </Button>
        )}
      </Box>

      {formData.certifications?.map((cert, index) => (
        <Box
          key={index}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          position="relative"
        >
          {isEditing && (
            <IconButton
              icon={<FaTrash />}
              position="absolute"
              top={2}
              right={2}
              colorScheme="red"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(index)}
              aria-label="Remove certification"
            />
          )}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={isEditing ? 6 : 0}>
            <FormControl>
              <FormLabel>Certification Name</FormLabel>
              <Input
                value={cert.name || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "name", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Issuing Organization</FormLabel>
              <Input
                value={cert.organization || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "organization", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Issue Date</FormLabel>
              <Input
                type="date"
                value={cert.issueDate || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "issueDate", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Expiry Date</FormLabel>
              <Input
                type="date"
                value={cert.expiryDate || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "expiryDate", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Credential ID</FormLabel>
              <Input
                value={cert.credentialId || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "credentialId", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Credential URL</FormLabel>
              <Input
                value={cert.credentialUrl || ""}
                onChange={(e) =>
                  handleCertificationChange(index, "credentialUrl", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>
          </SimpleGrid>
        </Box>
      ))}
    </VStack>
  );
};
