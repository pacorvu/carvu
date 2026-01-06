import { Box } from "@chakra-ui/react"
import { Hero } from "../components/Hero"
import { Stats } from "../components/Stats"
import { Recruiters } from "../components/Recruiters"
import { Testimonials } from "../components/Testimonials"

export const Home = () => {
  return (
    <Box>
      <Hero />
      <Stats />
      <Recruiters />
      <Testimonials />
    </Box>
  )
}
