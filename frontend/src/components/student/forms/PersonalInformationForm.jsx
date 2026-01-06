/**
 * Component: PersonalInformationForm
 * 
 * Fields:
 * - fullName (Text, Required)
 * - gender (Select, Options: Male, Female, Other)
 * - dateOfBirth (Date)
 * - languages (Text)
 * - schoolName (Text)
 * - yearOfJoining (Number)
 * - programId (Text)
 * - specializationId (Text)
 * - majorId (Text)
 * - minorId (Text)
 * 
 * Validation:
 * - fullName: Required, Min length 2
 * - dateOfBirth: Past date only
 * 
 * API Contracts:
 * - GET /api/student/profile/personal
 * - POST/PUT /api/student/profile/personal
 *   Body: { fullName, gender, dateOfBirth, ... }
 */

import { useState } from "react"
import { Box, SimpleGrid, Input, Select, VStack, HStack, Heading, Flex, Avatar, Button, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, IconButton } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { FaUser, FaSchool, FaLanguage, FaPlus } from "react-icons/fa"

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

export const PersonalInformationForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const formData = data || {}
  const [languageInput, setLanguageInput] = useState("")

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value })
  }

  const handleAddLanguage = () => {
    if (!languageInput.trim()) return
    const currentLanguages = formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(l => l) : []
    if (!currentLanguages.includes(languageInput.trim())) {
        const newLanguages = [...currentLanguages, languageInput.trim()]
        handleChange("languages", newLanguages.join(', '))
    }
    setLanguageInput("")
  }

  const handleRemoveLanguage = (langToRemove) => {
    const currentLanguages = formData.languages ? formData.languages.split(',').map(l => l.trim()).filter(l => l) : []
    const newLanguages = currentLanguages.filter(l => l !== langToRemove)
    handleChange("languages", newLanguages.join(', '))
  }

  const handleLanguageKeyDown = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault()
          handleAddLanguage()
      }
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <VStack spacing={8} align="stretch" gap={8}>
        
        {/* Profile Image & Basic Info */}
        <Flex gap={8} align="center" direction={{ base: "column", md: "row" }}>
            <Avatar size="2xl" name={formData.fullName} src={formData.profileImage} />
            <Box flex={1} w="full">
                <Field label="Full Name" required>
                    <Input value={formData.fullName || ""} onChange={(e) => handleChange("fullName", e.target.value)} variant="flushed" isDisabled={!isEditing} />
                </Field>
            </Box>
        </Flex>

        <Box>
          <SectionHeader title="Personal Details" icon={FaUser} />
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            <Field label="Gender">
                <Select variant="flushed" isDisabled={!isEditing} value={formData.gender || ""} onChange={(e) => handleChange("gender", e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </Select>
            </Field>
            <Field label="Date of Birth">
                <Input type="date" value={formData.dateOfBirth || ""} onChange={(e) => handleChange("dateOfBirth", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Languages Known">
                <HStack mb={2}>
                    <Input 
                        value={languageInput} 
                        onChange={(e) => setLanguageInput(e.target.value)} 
                        onKeyDown={handleLanguageKeyDown}
                        placeholder="Type a language" 
                        variant="flushed" 
                        isDisabled={!isEditing} 
                    />
                    <IconButton 
                        icon={<FaPlus />} 
                        size="sm" 
                        colorScheme="blue" 
                        onClick={handleAddLanguage} 
                        isDisabled={!isEditing || !languageInput.trim()}
                        aria-label="Add language"
                    />
                </HStack>
                <Wrap>
                    {formData.languages && formData.languages.split(',').map(l => l.trim()).filter(l => l).map((lang, index) => (
                        <WrapItem key={index}>
                            <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                                <TagLabel>{lang}</TagLabel>
                                {isEditing && <TagCloseButton onClick={() => handleRemoveLanguage(lang)} />}
                            </Tag>
                        </WrapItem>
                    ))}
                </Wrap>
            </Field>
          </SimpleGrid>
        </Box>

        <Box>
          <SectionHeader title="Academic Identity" icon={FaSchool} />
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Field label="School Name">
                <Input value={formData.schoolName || "RV University"} onChange={(e) => handleChange("schoolName", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Year of Joining">
                <Input type="number" value={formData.yearOfJoining || ""} onChange={(e) => handleChange("yearOfJoining", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Program">
                <Input value={formData.programId || ""} onChange={(e) => handleChange("programId", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Specialization">
                <Input value={formData.specializationId || ""} onChange={(e) => handleChange("specializationId", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Major">
                <Input value={formData.majorId || ""} onChange={(e) => handleChange("majorId", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Minor">
                <Input value={formData.minorId || ""} onChange={(e) => handleChange("minorId", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
          </SimpleGrid>
        </Box>

        <Box>
            <HStack justifyContent="flex-end" mt={4}>
                {/* Save button moved to parent layout */}
            </HStack>
        </Box>
      </VStack>
    </Box>
  )
}
