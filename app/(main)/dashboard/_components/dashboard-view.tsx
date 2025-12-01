"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import JobOpportunitiesSection from "./job-opportunities-section";

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

interface IndustryInsight {
  id: string;
  industry: string;
  salaryRanges: unknown[];
  growthRate: number;
  demandLevel: string;
  topSkills: string[];
  marketOutlook: string;
  keyTrends: string[];
  recommendedSkills: string[];
  lastUpdated: Date;
  nextUpdate: Date;
}

interface DashboardViewProps {
  insights: IndustryInsight;
  jobOpportunities: JobOpportunity[];
}

const resourceLinks: Record<string, string> = {
  python: "https://www.w3schools.com/python/",
  javascript: "https://www.w3schools.com/js/",
  typescript: "https://www.geeksforgeeks.org/typescript/",
  java: "https://www.geeksforgeeks.org/java/",
  "c++": "https://www.geeksforgeeks.org/c-plus-plus/",
  "c#": "https://www.geeksforgeeks.org/csharp-programming-language/",
  react: "https://www.geeksforgeeks.org/reactjs-tutorials/",
  "node.js": "https://www.geeksforgeeks.org/nodejs/",
  html: "https://www.w3schools.com/html/",
  css: "https://www.w3schools.com/css/",
  sql: "https://www.w3schools.com/sql/",
  aws: "https://www.geeksforgeeks.org/amazon-web-services-aws/",
  docker: "https://www.geeksforgeeks.org/docker-tutorial/",
  kubernetes: "https://www.geeksforgeeks.org/kubernetes-tutorial/",
  go: "https://www.geeksforgeeks.org/go-programming-language-golang/",
  rust: "https://www.geeksforgeeks.org/rust-programming-language/",
  "data science": "https://www.geeksforgeeks.org/data-science-tutorial/",
  "machine learning": "https://www.geeksforgeeks.org/machine-learning/",
};

const getSkillResourceLink = (skill: string) => {
  const normalized = skill.trim().toLowerCase();
  if (resourceLinks[normalized]) {
    return resourceLinks[normalized];
  }
  return `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(skill)}`;
};

const DashboardView: React.FC<DashboardViewProps> = ({ insights, jobOpportunities = [] }) => {
  // Transform salary data for the chart
  const salaryData = (insights.salaryRanges as Array<{
    role: string;
    min: number;
    max: number;
    median: number;
    location: string;
  }>).map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook: string) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

  // Format dates using date-fns
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {lastUpdatedDate}</Badge>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress value={insights.growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {insights.topSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Ranges Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Industry Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill) => (
                <a
                  key={skill}
                  href={getSkillResourceLink(skill)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-[1.03]"
                >
                  <Badge variant="outline">{skill}</Badge>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Opportunities Section */}
      <JobOpportunitiesSection jobs={jobOpportunities} />
    </div>
  );
};

export default DashboardView;
