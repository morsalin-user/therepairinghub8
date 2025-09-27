// Add this temporarily to your JobCard component to debug
export default function JobCard({ job, userType }) {
  // Debug logging - remove this after fixing
  console.log("Job object:", job);
  console.log("Job date value:", job.date);
  console.log("Job date type:", typeof job.date);
  console.log("Job date stringified:", JSON.stringify(job.date));
  
  // Rest of your component code...
}
