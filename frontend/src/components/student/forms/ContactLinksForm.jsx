/**
 * Component: ContactLinksForm
 * 
 * Fields:
 * - collegeEmail (Email, Required)
 * - personalEmail (Email, Required)
 * - phoneCountryCode (Text, Default: +91)
 * - phoneNumber (Tel, Required)
 * - linkedInUrl (Url)
 * - githubUrl (Url)
 * - portfolioUrl (Url)
 * 
 * Validation:
 * - emails: Valid email format
 * - phoneNumber: 10 digits
 * - urls: Valid URL format
 * 
 * API Contracts:
 * - GET /api/student/profile/contact
 * - POST/PUT /api/student/profile/contact
 *   Body: { collegeEmail, personalEmail, phoneNumber, linkedInUrl, ... }
 */

import { Box, SimpleGrid, Input, VStack, Heading, Flex, IconButton, Button } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { FaAddressBook, FaLink, FaPlus, FaTrash } from "react-icons/fa"

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

export const ContactLinksForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const formData = data || {}

  const handleChange = (field, value) => {
    onUpdate({ ...formData, [field]: value })
  }

  const handleLinkChange = (index, field, value) => {
    const currentLinks = Array.isArray(formData.links) ? [...formData.links] : []
    if (!currentLinks[index]) currentLinks[index] = {}
    currentLinks[index] = { ...currentLinks[index], [field]: value }
    onUpdate({ ...formData, links: currentLinks })
  }

  const handleAddLink = () => {
    const currentLinks = Array.isArray(formData.links) ? [...formData.links] : []
    onUpdate({ ...formData, links: [...currentLinks, { label: "", url: "" }] })
  }

  const handleRemoveLink = (index) => {
    const currentLinks = Array.isArray(formData.links) ? [...formData.links] : []
    const newLinks = currentLinks.filter((_, i) => i !== index)
    onUpdate({ ...formData, links: newLinks })
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <VStack spacing={8} align="stretch" gap={8}>
        
        <Box>
          <SectionHeader title="Contact Information" icon={FaAddressBook} />
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
            <Field label="College Email" required>
                <Input value={formData.collegeEmail || ""} onChange={(e) => handleChange("collegeEmail", e.target.value)} variant="flushed" type="email" isDisabled={!isEditing} />
            </Field>
            <Field label="Personal Email" required>
                <Input value={formData.personalEmail || ""} onChange={(e) => handleChange("personalEmail", e.target.value)} variant="flushed" type="email" isDisabled={!isEditing} />
            </Field>
            <Field label="Country Code">
                <Input value={formData.phoneCountryCode || "+91"} onChange={(e) => handleChange("phoneCountryCode", e.target.value)} variant="flushed" isDisabled={!isEditing} />
            </Field>
            <Field label="Phone Number" required>
                <Input value={formData.phoneNumber || ""} onChange={(e) => handleChange("phoneNumber", e.target.value)} variant="flushed" type="tel" isDisabled={!isEditing} />
            </Field>
          </SimpleGrid>
        </Box>

        <Box>
          <SectionHeader title="Social & Portfolio Links" icon={FaLink} />
          <VStack spacing={4} align="stretch">
            {(Array.isArray(formData.links) ? formData.links : []).map((link, index) => (
                <Flex key={index} gap={4} align="flex-end">
                    <Box flex="1">
                        <Field label="Label">
                            <Input 
                                value={link.label || ""} 
                                onChange={(e) => handleLinkChange(index, "label", e.target.value)} 
                                variant="flushed" 
                                placeholder="e.g. LinkedIn, GitHub" 
                                isDisabled={!isEditing} 
                            />
                        </Field>
                    </Box>
                    <Box flex="2">
                        <Field label="URL">
                            <Input 
                                value={link.url || ""} 
                                onChange={(e) => handleLinkChange(index, "url", e.target.value)} 
                                variant="flushed" 
                                placeholder="https://..." 
                                isDisabled={!isEditing} 
                            />
                        </Field>
                    </Box>
                    <IconButton 
                        icon={<FaTrash />} 
                        aria-label="Remove link" 
                        colorScheme="red" 
                        variant="ghost" 
                        onClick={() => handleRemoveLink(index)} 
                        isDisabled={!isEditing}
                        mb={2}
                    />
                </Flex>
            ))}
            
            {isEditing && (
                <Button 
                    leftIcon={<FaPlus />} 
                    onClick={handleAddLink} 
                    variant="outline" 
                    color="#d4a960" 
                    borderColor="#d4a960"
                    _hover={{ bg: "orange.50" }}
                    w="full"
                    borderStyle="dashed"
                >
                    Add Link
                </Button>
            )}
          </VStack>
        </Box>

      </VStack>
    </Box>
  )
}
