import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

export const CareerOverviewForm = ({ data = {}, onUpdate, isEditing }) => {
  const bg = useColorModeValue("white", "gray.700");
  const formData = data || {};

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <VStack spacing={6} align="stretch" bg={bg} p={6} borderRadius="lg" boxShadow="sm">
      <FormControl>
        <FormLabel>Brief Summary</FormLabel>
        <Textarea
          value={formData.briefSummary || ""}
          onChange={(e) => handleChange("briefSummary", e.target.value)}
          variant="flushed"
          minH="100px"
          isDisabled={!isEditing}
          _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Career Objective</FormLabel>
        <Textarea
          value={formData.careerObjective || ""}
          onChange={(e) => handleChange("careerObjective", e.target.value)}
          variant="flushed"
          minH="100px"
          isDisabled={!isEditing}
          _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Future Goals</FormLabel>
        <Textarea
          value={formData.futureGoals || ""}
          onChange={(e) => handleChange("futureGoals", e.target.value)}
          variant="flushed"
          minH="100px"
          isDisabled={!isEditing}
          _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Dream Companies</FormLabel>
        <Input
          value={formData.dreamCompanies || ""}
          onChange={(e) => handleChange("dreamCompanies", e.target.value)}
          variant="flushed"
          isDisabled={!isEditing}
          _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
          placeholder="Comma separated values"
        />
      </FormControl>
    </VStack>
  );
};
