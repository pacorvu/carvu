/**
 * Component: ParentDetailsForm
 * 
 * Fields:
 * - parentType (Select: Father, Mother, Guardian)
 * - name (Text, Required)
 * - occupation (Text)
 * - organization (Text)
 * - email (Email)
 * - phoneCountryCode (Text)
 * - phoneNumber (Tel, Required)
 * 
 * Validation:
 * - name: Required
 * - email: Valid format
 * - phoneNumber: 10 digits
 * 
 * API Contracts:
 * - GET /api/student/profile/family
 * - POST/PUT /api/student/profile/family
 *   Body: { parentType, name, occupation, email, phoneNumber, ... }
 */

import { Box, SimpleGrid, Input, Select, VStack, Heading, Flex, Button } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { FaUserFriends, FaMobile, FaEnvelope } from "react-icons/fa"

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

export const ParentDetailsForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const formData = data || {}

  const INITIAL_PARENTS = [
    { 
      parent_type: "Father",
      name: "", 
      occupation: "",
      organisation: "",
      email: "",
      phone_country_code: "+91",
      phone_number: ""
    },
    { 
      parent_type: "Mother",
      name: "", 
      occupation: "",
      organisation: "",
      email: "",
      phone_country_code: "+91",
      phone_number: ""
    }
  ]

  const parents = (formData.parents && formData.parents.length > 0) ? formData.parents : INITIAL_PARENTS

  const handleParentChange = (index, field, value) => {
    const currentParents = (formData.parents && formData.parents.length > 0) ? [...formData.parents] : JSON.parse(JSON.stringify(INITIAL_PARENTS))
    if (!currentParents[index]) currentParents[index] = {}
    currentParents[index] = { ...currentParents[index], [field]: value }
    onUpdate({ ...formData, parents: currentParents })
  }

  const handleAddParent = () => {
    const currentParents = (formData.parents && formData.parents.length > 0) ? [...formData.parents] : JSON.parse(JSON.stringify(INITIAL_PARENTS))
    onUpdate({ ...formData, parents: [...currentParents, { 
      name: "", 
      parent_type: "Guardian",
      occupation: "",
      organisation: "",
      email: "",
      phone_country_code: "+91",
      phone_number: ""
    }] })
  }

  const handleRemoveParent = (index) => {
    const currentParents = (formData.parents && formData.parents.length > 0) ? [...formData.parents] : JSON.parse(JSON.stringify(INITIAL_PARENTS))
    const newParents = currentParents.filter((_, i) => i !== index)
    onUpdate({ ...formData, parents: newParents })
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <VStack spacing={8} align="stretch">
        
        {parents.map((parent, index) => (
            <Box key={index}>
                <Flex justify="space-between" align="center" mb={4}>
                    <SectionHeader title={`${parent.parent_type || "Parent"}'s Details`} icon={FaUserFriends} />
                    {isEditing && (
                        <Button 
                            colorScheme="red" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveParent(index)}
                        >
                            Remove
                        </Button>
                    )}
                </Flex>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                    <Field label="Type" required>
                        <Select 
                            value={parent.parent_type || "Father"} 
                            onChange={(e) => handleParentChange(index, "parent_type", e.target.value)} 
                            variant="flushed" 
                            isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
                        >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Guardian">Guardian</option>
                        </Select>
                    </Field>
                    <Field label="Name" required>
                        <Input value={parent.name || ""} onChange={(e) => handleParentChange(index, "name", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                    </Field>
                    <Field label="Occupation">
                        <Input value={parent.occupation || ""} onChange={(e) => handleParentChange(index, "occupation", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                    </Field>
                    <Field label="Organisation">
                        <Input value={parent.organisation || ""} onChange={(e) => handleParentChange(index, "organisation", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                    </Field>
                    <Field label="Mobile Number" required>
                        <Flex gap={2}>
                            <Input 
                                w="80px"
                                value={parent.phone_country_code || "+91"} 
                                onChange={(e) => handleParentChange(index, "phone_country_code", e.target.value)} 
                                variant="flushed" 
                                isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                            />
                            <Input 
                                type="tel" 
                                value={parent.phone_number || ""} 
                                onChange={(e) => handleParentChange(index, "phone_number", e.target.value)} 
                                variant="flushed" 
                                isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                            />
                        </Flex>
                    </Field>
                    <Field label="Email ID">
                        <Input type="email" value={parent.email || ""} onChange={(e) => handleParentChange(index, "email", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                    </Field>
                </SimpleGrid>
            </Box>
        ))}

        {isEditing && (
            <Button 
                onClick={handleAddParent} 
                variant="outline" 
                colorScheme="blue" 
                alignSelf="start"
            >
                Add Parent/Guardian
            </Button>
        )}

      </VStack>
    </Box>
  )
}
