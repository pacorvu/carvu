/**
 * Component: ProjectsForm
 * 
 * Fields (Repeatable):
 * - title (Text, Required)
 * - description (Textarea)
 * - skills (Text, Comma separated)
 * - projectLink (Url)
 * - snaps (Url/Text)
 * - mentorName (Text)
 * 
 * Validation:
 * - title: Required
 * 
 * API Contracts:
 * - GET /api/student/profile/projects
 * - POST /api/student/profile/projects
 */

import { Box, VStack, Heading, Button, HStack, Input, SimpleGrid, IconButton, Text, Card, CardBody, Collapse, Flex, Textarea } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState } from "react"
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

export const ProjectsForm = ({ data = {}, onUpdate, isEditing = false }) => {
  // Ensure we handle data as array (similar to Academics/Education)
  const items = Array.isArray(data) ? data : (data.projects || [])

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
        description: "",
        skills: "",
        projectLink: "",
        snaps: "",
        mentorName: ""
      }
    ])
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Projects</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <ProjectItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleChange} 
            onDelete={handleDelete}
            isEditing={isEditing} 
          />
        ))}

        {isEditing && (
            <Button 
            leftIcon={<FaPlus />} 
            onClick={handleAdd} 
            variant="outline" 
            colorScheme="orange" 
            borderColor="#d4a960" 
            color="#d4a960"
            _hover={{ bg: "#fff5e6" }}
            >
            Add Project
            </Button>
        )}
        
        {items.length === 0 && (
            <Box p={8} textAlign="center" color="gray.500" border="1px dashed" borderColor="gray.300" borderRadius="xl">
                No projects added yet.
            </Box>
        )}
      </VStack>
    </Box>
  )
}

const ProjectItem = ({ index, item, onChange, onDelete, isEditing }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Card variant="outline" borderColor="gray.200">
      <CardBody p={4}>
        <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0}>
            <HStack onClick={() => setIsOpen(!isOpen)} cursor="pointer" flex={1}>
                <Text fontWeight="bold" color="gray.700">
                    {item.title || `Project ${index + 1}`}
                </Text>
                {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </HStack>
            {isEditing && (
                <IconButton 
                    size="sm" 
                    variant="ghost" 
                    color="red.500" 
                    aria-label="Delete" 
                    onClick={() => onDelete(index)}
                >
                    <FaTrash />
                </IconButton>
            )}
        </Flex>

        <Collapse in={isOpen}>
            <VStack mt={4} align="stretch" gap={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field label="Project Title (Required)" required>
                        <Input 
                            value={item.title || ""} 
                            onChange={(e) => onChange(index, "title", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} 
                            placeholder="e.g. E-Commerce Website"
                        />
                    </Field>
                    <Field label="Mentor Name">
                        <Input 
                            value={item.mentorName || ""} 
                            onChange={(e) => onChange(index, "mentorName", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                            placeholder="e.g. Dr. Smith"
                        />
                    </Field>
                    <Field label="Technologies (comma separated)">
                        <Input 
                            placeholder="React, Node.js, MongoDB"
                            value={item.skills || ""} 
                            onChange={(e) => onChange(index, "skills", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing} 
                        />
                    </Field>
                    <Field label="Project Link (GitHub/Live)">
                        <Input 
                            value={item.projectLink || ""} 
                            onChange={(e) => onChange(index, "projectLink", e.target.value)} 
                            variant="flushed"
                            isDisabled={!isEditing}
                            placeholder="https://github.com/..."
                        />
                    </Field>
                    <Field label="Snaps/Proof Link">
                        <Input 
                            value={item.snaps || ""}
                            onChange={(e) => onChange(index, "snaps", e.target.value)} 
                            variant="flushed" 
                            isDisabled={!isEditing}
                            placeholder="https://drive.google.com/..." 
                        />
                    </Field>
                </SimpleGrid>
                <Field label="Description">
                    <Textarea 
                        value={item.description || ""} 
                        onChange={(e) => onChange(index, "description", e.target.value)} 
                        variant="flushed"
                        rows={3}
                        isDisabled={!isEditing}
                        placeholder="Briefly describe your project..."
                    />
                </Field>
            </VStack>
        </Collapse>
      </CardBody>
    </Card>
  )
}
