/**
 * Component: EducationForm
 * 
 * Fields (Repeatable):
 * - educationLevel (Select: 10th, 12th, Undergraduate, Postgraduate)
 * - instituteName (Text)
 * - boardOrUniversity (Text)
 * - city (Text)
 * - yearOfPassing (Number)
 * - resultType (Select: Percentage, CGPA)
 * - result (Text/Number)
 * - subjects (Text)
 * - gapDetails (Optional)
 * 
 * Validation:
 * - instituteName: Required
 * - yearOfPassing: Valid year
 * - result: Numeric
 * 
 * API Contracts:
 * - GET /api/student/profile/education
 * - POST /api/student/profile/education (Add Item)
 * - PUT /api/student/profile/education/:id (Update Item)
 * - DELETE /api/student/profile/education/:id (Delete Item)
 */

import { useState } from "react"
import { Box, SimpleGrid, Input, Select, VStack, Heading, Flex, Button, Text, IconButton, Collapse } from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { FaGraduationCap, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"

const EducationItem = ({ item, onChange, onDelete, index, isOpen, onToggle, isEditing }) => {
  const handleChange = (field, value) => {
    onChange({ ...item, [field]: value }, index)
  }

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} bg="white">
      <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0} cursor="pointer" onClick={onToggle}>
        <VStack align="start" gap={0}>
            <Heading size="sm" color="#20343c">{item.educationLevel || "New Education Entry"}</Heading>
            <Text fontSize="xs" color="gray.500">{item.instituteName}</Text>
        </VStack>
        <Flex gap={2}>
            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(index); }} aria-label="Delete" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            <IconButton icon={isOpen ? <FaChevronUp /> : <FaChevronDown />} size="sm" variant="ghost" aria-label="Toggle" />
        </Flex>
      </Flex>
      
      <Collapse in={isOpen}>
        <VStack spacing={6} align="stretch" mt={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Field label="Education Level">
                <Select variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} value={item.educationLevel || ""} onChange={(e) => handleChange("educationLevel", e.target.value)}>
                    <option value="">Select Level</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                </Select>
            </Field>
            <Field label="Institute Name">
                <Input value={item.instituteName || ""} onChange={(e) => handleChange("instituteName", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="Board / University">
                <Input value={item.boardOrUniversity || ""} onChange={(e) => handleChange("boardOrUniversity", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="City">
                <Input value={item.city || ""} onChange={(e) => handleChange("city", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="Year of Passing">
                <Input type="number" value={item.yearOfPassing || ""} onChange={(e) => handleChange("yearOfPassing", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="Result Type">
                <Select variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} value={item.resultType || ""} onChange={(e) => handleChange("resultType", e.target.value)}>
                    <option value="Percentage">Percentage</option>
                    <option value="CGPA">CGPA</option>
                </Select>
            </Field>
            <Field label="Result Value">
                <Input value={item.result || ""} onChange={(e) => handleChange("result", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="Subjects">
                <Input value={item.subjects || ""} onChange={(e) => handleChange("subjects", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            </Field>
            <Field label="Upload Marksheet/Certificate">
                <Input 
                    type="file" 
                    p={1} 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleChange("proofFile", e.target.files[0]?.name)} 
                    variant="flushed" 
                    isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                />
                {item.proofFile && <Text fontSize="xs" color="green.500">Uploaded: {item.proofFile}</Text>}
            </Field>
          </SimpleGrid>
          
          <Box bg="gray.50" p={4} borderRadius="md">
            <Heading size="xs" mb={4} color="gray.600">Gap Details (If any)</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                 <Field label="Gap Type">
                    <Input value={item.gapType || ""} onChange={(e) => handleChange("gapType", e.target.value)} variant="flushed" placeholder="e.g. Preparation" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                </Field>
                <Field label="Duration (Months)">
                    <Input type="number" value={item.gapDurationMonths || ""} onChange={(e) => handleChange("gapDurationMonths", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                </Field>
                <Field label="Reason">
                    <Input value={item.gapReason || ""} onChange={(e) => handleChange("gapReason", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
                </Field>
            </SimpleGrid>
          </Box>
          </VStack>
      </Collapse>
    </Box>
  )
}

export const EducationForm = ({ data = {}, onUpdate, isEditing = false }) => {
  // Ensure items is always an array
  const items = Array.isArray(data) ? data : []

  const handleChange = (updatedItem, index) => {
      const newItems = [...items]
      newItems[index] = updatedItem
      onUpdate(newItems)
  }

  const handleAdd = () => {
      onUpdate([
          ...items,
          {
              educationLevel: "",
              instituteName: "",
              boardOrUniversity: "",
              city: "",
              yearOfPassing: "",
              resultType: "",
              result: "",
              subjects: ""
          }
      ])
  }

  const handleDelete = (index) => {
      const newItems = items.filter((_, i) => i !== index)
      onUpdate(newItems)
  }

  const [openIndex, setOpenIndex] = useState(0)

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Education History</Heading>
      
      <VStack spacing={6} align="stretch">
        {items.map((item, index) => (
          <EducationItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleChange} 
            onDelete={handleDelete}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
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
          isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        >
          Add Education
        </Button>
      </VStack>
    </Box>
  )
}
