"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, RefreshCw } from "lucide-react";
import JobOpportunityCard from "./job-opportunity-card";

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string | null;
  experience?: string | null;
  platform: string;
  url: string;
  postedDate: Date;
  deadline?: Date | null;
  isActive: boolean;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JobOpportunitiesSectionProps {
  jobs: JobOpportunity[];
}

const JobOpportunitiesSection: React.FC<JobOpportunitiesSectionProps> = ({ jobs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // Filter jobs based on search term, type, and platform
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesPlatform = selectedPlatform === "all" || job.platform === selectedPlatform;
    
    return matchesSearch && matchesType && matchesPlatform;
  });

  // Group jobs by type
  const jobsByType = {
    internship: filteredJobs.filter(job => job.type === "internship"),
    "full-time": filteredJobs.filter(job => job.type === "full-time"),
    "part-time": filteredJobs.filter(job => job.type === "part-time"),
    contract: filteredJobs.filter(job => job.type === "contract"),
  };

  // Get unique platforms
  const platforms = [...new Set(jobs.map(job => job.platform))];

  // Get unique job types
  const jobTypes = [...new Set(jobs.map(job => job.type))];

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Job Opportunities
          </CardTitle>
          <CardDescription>
            Current job openings and internships in your industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Loading job opportunities...</h3>
            <p className="text-gray-500 mb-4">
              We&apos;re currently fetching the latest job opportunities for your industry. 
              This may take a moment due to high API traffic.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Please wait while we load jobs...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Job Opportunities
        </CardTitle>
        <CardDescription>
          Current job openings and internships in your industry ({filteredJobs.length} opportunities)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="space-y-3">
            {/* Job Type Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Job Type</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                  className="text-xs"
                >
                  All Types
                </Button>
                {jobTypes.map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className="text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Platform</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPlatform === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform("all")}
                  className="text-xs"
                >
                  All Platforms
                </Button>
                {platforms.map(platform => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className="text-xs capitalize"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="internship" className="text-xs sm:text-sm">
              Internships ({jobsByType.internship.length})
            </TabsTrigger>
            <TabsTrigger value="full-time" className="text-xs sm:text-sm">
              Full-time ({jobsByType["full-time"].length})
            </TabsTrigger>
            <TabsTrigger value="part-time" className="text-xs sm:text-sm">
              Part-time ({jobsByType["part-time"].length})
            </TabsTrigger>
            <TabsTrigger value="contract" className="text-xs sm:text-sm">
              Contract ({jobsByType.contract.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No jobs match your filters</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters to see more opportunities.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredJobs.map((job) => (
                  <JobOpportunityCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          {Object.entries(jobsByType).map(([type, typeJobs]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {typeJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No {type} jobs match your filters
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters to see more opportunities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {typeJobs.map((job) => (
                    <JobOpportunityCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JobOpportunitiesSection;
