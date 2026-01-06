/**
 * Component: CertificationsForm
 * 
 * Fields (Repeatable):
 * - name (Text, Required)
 * - issuingOrg (Text)
 * - issueDate (Date)
 * - expiryDate (Date)
 * - credentialUrl (Url)
 * 
 * Validation:
 * - name: Required
 * - credentialUrl: Valid URL
 * 
 * API Contracts:
 * - GET /api/student/profile/certifications
 * - POST /api/student/profile/certifications
 * - PUT /api/student/profile/certifications/:id
 * - DELETE /api/student/profile/certifications/:id
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const CertificationsForm = ({ data = {}, onUpdate, isEditing = false }) => {
  const items = Array.isArray(data) ? data : []

  const handleChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onUpdate(newItems)
  }

  const handleAdd = () => {
    onUpdate([
      ...items,
      {
        title: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        credentialID: "",
        certificateLink: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Certifications</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <CertificationItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleChange} 
            onDelete={handleDelete}
            isEditing={isEditing} 
          />
        ))}

        <Button 
          leftIcon={<FaPlus />} 
          onClick={handleAdd} 
          variant="outline" 
          colorScheme="orange" 
          borderColor="#d4a960" 
          color="#d4a960"
          _hover={{ bg: "#fff5e6" }}
          isDisabled={!isEditing}
        >
          Add Certification
        </Button>
      </VStack>
    </Box>
  )
}

const CertificationItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    {item.title || `Certification ${index + 1}`}
                </Text>
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </HStack>
            <IconButton 
                size="sm" 
                variant="ghost" 
                color="red.500" 
                aria-label="Delete" 
                onClick={() => onDelete(index)}
                isDisabled={!isEditing}
            >
                <FaTrash />
            </IconButton>
        </Flex>

        <Collapse in={isOpen}>
            <VStack mt={4} align="stretch" gap={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Certification Title">
                        <Input 
                            value={item.title || ""} 
                            onChange={(e) => onChange(index, "title", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Issuing Organization">
                        <Input 
                            value={item.issuingOrganization || ""} 
                            onChange={(e) => onChange(index, "issuingOrganization", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Issue Date">
                        <Input 
                            type="date"
                            value={item.issueDate || ""} 
                            onChange={(e) => onChange(index, "issueDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Expiry Date (if any)">
                        <Input 
                            type="date"
                            value={item.expiryDate || ""} 
                            onChange={(e) => onChange(index, "expiryDate", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Credential ID">
                        <Input 
                            value={item.credentialID || ""} 
                            onChange={(e) => onChange(index, "credentialID", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                    </Field>
                    <Field label="Upload Certificate">
                        <Input 
                            type="file"
                            p={1}
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(index, "certificateLink", e.target.files[0]?.name)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                        />
                        {item.certificateLink && <Text fontSize="xs" color="green.500">Uploaded: {item.certificateLink}</Text>}
                    </Field>
                </SimpleGrid>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
