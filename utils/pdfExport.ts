import { Task } from "../components/constants/taskData";

export const handleExportAndRefresh = async (
  tasks: Task[],
  loadUserProgress: () => Promise<void>,
  setActiveTab: (tab: "dashboard" | "checklist" | "insights") => void
) => {
  try {
    console.log("Starting export and refresh process...");
    
    // Step 1: Generate and save PDF report
    try {
      const { generatePDF } = await import('../components/utils/pdfGenerator');
      const { generateDentalSuggestions } = await import('../components/utils/dentalSuggestions');
      
      const safeTasks = Array.isArray(tasks) ? tasks : [];
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const suggestions = generateDentalSuggestions(safeTasks);
      
      console.log("Generating PDF report...");
      const pdf = await generatePDF(safeTasks, currentMonth, suggestions);
      
      // Save the PDF
      pdf.save(`Workflow-Tracker-Report-${currentMonth.replace(' ', '-')}.pdf`);
      console.log("PDF report generated and saved successfully");
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      alert("Warning: Could not generate PDF report, but continuing with data refresh...");
    }
    
    // Step 2: Refresh data from server (no need to save since auto-save is already active)
    await loadUserProgress();
    console.log("Data refreshed from server successfully");
    
    // Step 3: Navigate back to dashboard
    setActiveTab("dashboard");
    
    alert("PDF report saved and data refreshed successfully!");
  } catch (error: unknown) {
    console.error("Error during export and refresh:", error);
    alert("Error during export and refresh. Please try again.");
  }
};