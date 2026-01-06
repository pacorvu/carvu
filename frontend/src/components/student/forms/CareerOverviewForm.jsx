/**
 * Component: CareerOverviewForm
 * 
 * Fields:
 * - briefSummary (Textarea)
 * - keyExpertise (Text)
 * - careerObjective (Textarea)
 * - hobbiesInterests (Text)
 * - dreamCompany (Text)
 * - dreamPackage (Number)
 * 
 * Validation:
 * - briefSummary: Max 500 chars
 * - dreamPackage: Positive number
 * 
 * API Contracts:
 * - GET /api/student/profile/career
 * - POST/PUT /api/student/profile/career
 *   Body: { briefSummary, keyExpertise, careerObjective, dreamCompany, ... }
 */

import { Box, SimpleGrid, Input, Textarea, VStack, Heading, Flex } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { FaBriefcase, FaStar } from "react-icons/fa"

const SectionHeader = ({ title, icon: Icon }) => (
  <Flex align="center" gap={3} mb={6} borderBottom="1px solid" borderColor="gray.200" pb={2}>
    <Box p={2} bg="orange.50" borderRadius="md" color="#d4a960">
      <Icon size={18} />
    </Box>
    <Heading size="md" color="#20343c" fontWeight="bold">
      {title}
    </Heading>
  </Flex>
)

export const CareerOverviewForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const formData = data || {}

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value })
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <VStack spacing={8} align="stretch" gap={8}>
        
        <Box>
          <SectionHeader title="Career Objectives" icon={FaBriefcase} />
          <VStack gap={6}>
            <Field label="Brief Profile Summary">
                <Textarea value={formData.briefSummary || ""} onChange={(e) => handleChange("briefSummary", e.target.value)} variant="flushed" minH="100px" isDisabled={!isEditing} />
            </Field>
            <Field label="Key Expertise (Comma separated)">
                <Input value={formData.keyExpertise || ""} onChange={(e) => handleChange("keyExpertise", e.target.value)} variant="flushed" placeholder="e.g. React, Node.js, Python" isDisabled={!isEditing} />
            </Field>
            <Field label="Career Objective">
                <Textarea value={formData.careerObjective || ""} onChange={(e) => handleChange("careerObjective", e.target.value)} variant="flushed" minH="100px" isDisabled={!isEditing} />
            </Field>
            <Field label="Hobbies & Interests">
                <Input value={formData.hobbiesInterests || ""} onChange={(e) => handleChange("hobbiesInterests", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
          </VStack>
        </Box>

        <Box>
          <SectionHeader title="Aspirations" icon={FaStar} />
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Field label="Dream Company">
                <Input value={formData.dreamCompany || ""} onChange={(e) => handleChange("dreamCompany", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Expected / Dream Package (LPA)">
                <Input value={formData.dreamPackage || ""} onChange={(e) => handleChange("dreamPackage", e.target.value)} variant="flushed" type="number" isDisabled={!isEditing} />
            </Field>
          </SimpleGrid>
        </Box>

      </VStack>
    </Box>
  )
}
