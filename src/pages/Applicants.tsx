<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Full Name</TableHead>
      <TableHead>Nationality</TableHead>
      <TableHead>Area</TableHead>
      <TableHead>Visa Type</TableHead>
      <TableHead>Expiry Date</TableHead> {/* New column */}
      <TableHead>Status</TableHead>
      <TableHead>ID Card</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredApplicants.length === 0 ? (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
          No applicants found matching your search.
        </TableCell>
      </TableRow>
    ) : (
      filteredApplicants.map((applicant) => (
        <TableRow key={applicant.id}>
          <TableCell className="font-medium">{applicant.fullName}</TableCell>
          <TableCell>{applicant.nationality}</TableCell>
          <TableCell>{applicant.area || applicant.passportNumber || 'Not provided'}</TableCell>
          <TableCell>{applicant.visaType}</TableCell>
          {/* New expiry date column */}
          <TableCell>
            {applicant.expiryDate ? new Date(applicant.expiryDate).toLocaleDateString() : 'N/A'}
          </TableCell>
          <TableCell>{getStatusBadge(applicant.status)}</TableCell>
          <TableCell>
            {applicant.idCardApproved && (
              <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
            )}
          </TableCell>
          {/* Actions remain the same */}
          <TableCell>
            {/* ... your dropdown menu ... */}
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>
