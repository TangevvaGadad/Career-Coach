// types.ts
export type CoverLetter = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    content: string;
    jobDescription: string | null;  // Allow jobDescription to be string or null
    companyName: string;
    jobTitle: string;
    status: string;
  };
  