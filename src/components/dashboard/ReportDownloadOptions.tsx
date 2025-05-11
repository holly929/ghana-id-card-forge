
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FilePdf, 
  Download, 
  FileExcel,
  FileCsv
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TimePeriod } from '@/hooks/useDashboardData';

interface ReportDownloadOptionsProps {
  timePeriod: TimePeriod;
  data: any[];
}

export const ReportDownloadOptions: React.FC<ReportDownloadOptionsProps> = ({ 
  timePeriod, 
  data 
}) => {
  const generateCSV = () => {
    try {
      // Create CSV header
      let csvContent = "date,applicants,cards\n";
      
      // Add data rows
      data.forEach(item => {
        csvContent += `${item.date},${item.applicants},${item.cards}\n`;
      });
      
      // Create downloadable link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ghana-immigration-report-${timePeriod}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); // Append to body to ensure it works in all browsers
      link.click();
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(url); // Clean up the URL object
      
      toast({
        title: "Report downloaded successfully",
        description: `${timePeriod} report has been downloaded as CSV`,
      });
    } catch (error) {
      console.error("Error generating CSV:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating the report",
        variant: "destructive",
      });
    }
  };

  const generatePDF = () => {
    toast({
      title: "PDF Generation",
      description: "PDF report generation started. This may take a moment.",
    });
    
    try {
      // Create a simple PDF content with tabular data
      let pdfContent = `
        Ghana Immigration Report (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
        Generated on: ${new Date().toLocaleDateString()}
        
        Date | New Applicants | ID Cards Issued
        ${data.map(item => `${item.date} | ${item.applicants} | ${item.cards}`).join('\n')}
      `;
      
      // Create a Blob with the content
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ghana-immigration-report-${timePeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generation Completed",
        description: "Your PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF generation failed",
        description: "There was an error generating the PDF report",
        variant: "destructive",
      });
    }
  };

  const generateExcel = () => {
    try {
      let excelContent = "date\tapplicants\tcards\n";
      
      data.forEach(item => {
        excelContent += `${item.date}\t${item.applicants}\t${item.cards}\n`;
      });
      
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ghana-immigration-report-${timePeriod}-${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Excel report downloaded",
        description: `${timePeriod} report has been downloaded as Excel file`,
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating the Excel report",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={generateCSV}
      >
        <FileCsv size={16} />
        <span className="hidden sm:inline">Export CSV</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download size={16} />
            <span className="hidden sm:inline">More Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={generatePDF} className="flex items-center gap-2">
            <FilePdf size={16} />
            <span>Export as PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={generateExcel} className="flex items-center gap-2">
            <FileExcel size={16} />
            <span>Export as Excel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ReportDownloadOptions;
