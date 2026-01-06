import React from "react";
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";

export const ContactLinksForm = ({ data = {}, onUpdate, isEditing }) => {
  const bg = useColorModeValue("white", "gray.700");
  const formData = data || {};

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <VStack spacing={6} align="stretch" bg={bg} p={6} borderRadius="lg" boxShadow="sm">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel>College Email</FormLabel>
          <Input
            value={formData.collegeEmail || ""}
            onChange={(e) => handleChange("collegeEmail", e.target.value)}
            variant="flushed"
            type="email"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Personal Email</FormLabel>
          <Input
            value={formData.personalEmail || ""}
            onChange={(e) => handleChange("personalEmail", e.target.value)}
            variant="flushed"
            type="email"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Mobile Number</FormLabel>
          <Input
            value={formData.mobileNumber || ""}
            onChange={(e) => handleChange("mobileNumber", e.target.value)}
            variant="flushed"
            type="tel"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>LinkedIn URL</FormLabel>
          <Input
            value={formData.linkedinUrl || ""}
            onChange={(e) => handleChange("linkedinUrl", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>GitHub URL</FormLabel>
          <Input
            value={formData.githubUrl || ""}
            onChange={(e) => handleChange("githubUrl", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Portfolio URL</FormLabel>
          <Input
            value={formData.portfolioUrl || ""}
            onChange={(e) => handleChange("portfolioUrl", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            variant="flushed"
            isDisabled={!isEditing}
            _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};
