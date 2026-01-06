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

export const AcademicPerformanceForm = ({ data = {}, onUpdate, isEditing }) => {
  const bg = useColorModeValue("white", "gray.700");
  const formData = data || {};

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value });
  };

  const handleAdd = () => {
    const newEducation = [
      ...(formData.education || []),
      { exam: "", year: "", school: "", board: "", percentage: "" },
    ];
    handleChange("education", newEducation);
  };

  const handleRemove = (index) => {
    const newEducation = formData.education.filter((_, i) => i !== index);
    handleChange("education", newEducation);
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...(formData.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    handleChange("education", newEducation);
  };

  return (
    <VStack spacing={6} align="stretch" bg={bg} p={6} borderRadius="lg" boxShadow="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="md">Education Details</Heading>
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
            Add Education
          </Button>
        )}
      </Box>

      {formData.education?.map((edu, index) => (
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
              aria-label="Remove education"
            />
          )}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={isEditing ? 6 : 0}>
            <FormControl>
              <FormLabel>Exam/Degree</FormLabel>
              <Input
                value={edu.exam || ""}
                onChange={(e) =>
                  handleEducationChange(index, "exam", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Year of Passing</FormLabel>
              <Input
                type="number"
                value={edu.year || ""}
                onChange={(e) =>
                  handleEducationChange(index, "year", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>School/College</FormLabel>
              <Input
                value={edu.school || ""}
                onChange={(e) =>
                  handleEducationChange(index, "school", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Board/University</FormLabel>
              <Input
                value={edu.board || ""}
                onChange={(e) =>
                  handleEducationChange(index, "board", e.target.value)
                }
                variant="flushed"
                isDisabled={!isEditing}
                _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Percentage/CGPA</FormLabel>
              <Input
                value={edu.percentage || ""}
                onChange={(e) =>
                  handleEducationChange(index, "percentage", e.target.value)
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
