<!DOCTYPE html>
<html>
<body>
<h2>New Vendor Application</h2>
<p>A new vendor application has been submitted and is awaiting review.</p>
<table>
    <tr><td><strong>Store Name:</strong></td><td>{{ $vendor->store_name }}</td></tr>
    <tr><td><strong>Store Name (AR):</strong></td><td>{{ $vendor->store_name_ar }}</td></tr>
    <tr><td><strong>Applicant:</strong></td><td>{{ $vendor->user->name }} ({{ $vendor->user->email }})</td></tr>
    <tr><td><strong>Applied At:</strong></td><td>{{ $vendor->created_at->toDateTimeString() }}</td></tr>
</table>
<p>Please log in to the admin panel to review this application.</p>
</body>
</html>
