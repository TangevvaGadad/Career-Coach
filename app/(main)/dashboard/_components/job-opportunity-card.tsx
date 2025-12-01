"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Calendar, DollarSign, Briefcase, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

interface JobOpportunityCardProps {
  job: JobOpportunity;
}

const JobOpportunityCard: React.FC<JobOpportunityCardProps> = ({ job }) => {
  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-yellow-100 text-yellow-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "internshala":
        return "bg-orange-100 text-orange-800";
      case "unstop":
        return "bg-red-100 text-red-800";
      case "linkedin":
        return "bg-blue-100 text-blue-800";
      case "indeed":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isDeadlineNear = job.deadline && new Date(job.deadline).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">{job.title}</CardTitle>
            <CardDescription className="text-base font-medium text-gray-700 truncate">{job.company}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Badge className={`${getJobTypeColor(job.type)} text-xs px-2 py-1`}>
              {job.type}
            </Badge>
            <Badge variant="outline" className={`${getPlatformColor(job.platform)} text-xs px-2 py-1`}>
              {job.platform}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Location and Experience */}
        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          {job.experience && (
            <div className="flex items-center gap-1 min-w-0">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.experience}</span>
            </div>
          )}
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="flex items-center gap-1 text-sm text-green-700 font-medium">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{job.description}</p>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Required Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{job.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* Posted Date and Deadline */}
        <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}</span>
          </div>
          {job.deadline && (
            <div className={`flex items-center gap-1 ${isDeadlineNear ? 'text-red-600 font-medium' : ''}`}>
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {isDeadlineNear ? 'Deadline soon: ' : 'Deadline: '}
                {format(new Date(job.deadline), 'MMM dd')}
              </span>
            </div>
          )}
        </div>

        {/* Apply Button */}
        <Button 
          asChild 
          className="w-full mt-4"
          variant={isDeadlineNear ? "destructive" : "default"}
          size="sm"
        >
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Apply Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobOpportunityCard;
