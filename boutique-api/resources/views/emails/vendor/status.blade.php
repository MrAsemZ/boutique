<!DOCTYPE html>
<html>
<body>
<h2>Vendor Application Update</h2>

@if($status === 'approved')
    <p>Congratulations! Your application for <strong>{{ $vendor->store_name }}</strong> has been <strong>approved</strong>.</p>
    <p>You can now log in and start listing your products.</p>
@else
    <p>We regret to inform you that your application for <strong>{{ $vendor->store_name }}</strong> has not been approved at this time.</p>
    @if($reason)
        <p><strong>Reason:</strong> {{ $reason }}</p>
    @endif
    <p>You may re-apply after addressing the above concerns.</p>
@endif
</body>
</html>
