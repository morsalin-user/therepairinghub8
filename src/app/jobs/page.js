"use client"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Filter, MapPin } from "lucide-react"
import JobListingPreview from "@/components/job-listing-preview"
import { jobAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"

export default function Jobs() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [categories, setCategories] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const { success, jobs } = await jobAPI.getJobs({ status: "active" })
      if (success) {
        setJobs(jobs)
        setFilteredJobs(jobs)
        const uniqueCategories = [...new Set(jobs.map((job) => job.category).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: t("common.error"),
        description: t("messages.error.generic"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let results = jobs
    if (searchTerm) {
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    results = results.filter((job) => job.price >= priceRange[0] && job.price <= priceRange[1])
    if (category && category !== "all") {
      results = results.filter((job) => job.category === category)
    }
    if (location) {
      results = results.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()))
    }
    setFilteredJobs(results)
  }, [searchTerm, priceRange, category, location, jobs])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePriceChange = (value) => {
    setPriceRange(value)
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
  }

  const handleLocationChange = (e) => {
    setLocation(e.target.value)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setPriceRange([0, 500])
    setCategory("")
    setLocation("")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        {/* Filters */}
        <Card className="w-full md:w-64 sticky top-20">
          <CardHeader>
            <CardTitle className="text-xl">{t("jobsPage.filters")}</CardTitle>
            <CardDescription>{t("jobsPage.refineSearch")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("jobsPage.priceRange")}</Label>
              <div className="pt-4">
                <Slider
                  defaultValue={[0, 500]}
                  max={500}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("jobsPage.category")}</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("jobsPage.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobsPage.allCategories")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("jobsPage.location")}</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("jobsPage.enterLocation")}
                  value={location}
                  onChange={handleLocationChange}
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              {t("jobsPage.resetFilters")}
            </Button>
          </CardContent>
        </Card>
        {/* Job Listings */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("jobsPage.searchJobs")}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-8"
                />
              </div>
              {/* Mobile filters button */}
              <Button variant="outline" className="sm:hidden flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("jobsPage.filters")}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{t("jobsPage.availableJobs")}</h1>
              <p className="text-gray-500">{t("jobsPage.jobsFound", { count: filteredJobs.length })}</p>
            </div>
          </div>
          {filteredJobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobListingPreview
                  key={job._id}
                  id={job._id}
                  title={job.title}
                  price={`$${job.price}`}
                  location={job.location}
                  date={new Date(job.date).toLocaleDateString()}
                  category={job.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-medium mb-2">{t("jobsPage.noJobsFound")}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{t("jobsPage.adjustFilters")}</p>
              <Button onClick={resetFilters}>{t("jobsPage.resetFilters")}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
