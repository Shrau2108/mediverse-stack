// Initialize Pusher
const pusher = new Pusher(process.env.MIX_PUSHER_APP_KEY, {
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: true
});

// Subscribe to channels
const prescriptionsChannel = pusher.subscribe('prescriptions');
const labReportsChannel = pusher.subscribe('lab-reports');
const treatmentsChannel = pusher.subscribe('treatments');
const billsChannel = pusher.subscribe('bills');
const paymentsChannel = pusher.subscribe('payments');

// Listen for prescription created event
prescriptionsChannel.bind('prescription.created', function(data) {
    console.log('New prescription created:', data);
    showNotification(`New prescription created for patient #${data.patient_id}`, 'info');
});

// Listen for prescription dispatched event
prescriptionsChannel.bind('prescription.dispatched', function(data) {
    console.log('Prescription dispatched:', data);
    showNotification(`Prescription #${data.prescription_id} has been dispatched`, 'success');
});

// Listen for lab report uploaded event
labReportsChannel.bind('lab.report.uploaded', function(data) {
    console.log('Lab report uploaded:', data);
    showNotification(`New lab report available for patient #${data.patient_id}`, 'info');
});

// Listen for treatment updated event
treatmentsChannel.bind('treatment.updated', function(data) {
    console.log('Treatment updated:', data);
    showNotification(`Treatment #${data.treatment_id} status updated to ${data.status}`, 'info');
});

// Listen for bill generated event
billsChannel.bind('bill.generated', function(data) {
    console.log('Bill generated:', data);
    showNotification(`New bill #${data.bill_id} generated for ${data.patient_name}`, 'info');
});

// Listen for payment completed event
paymentsChannel.bind('payment.completed', function(data) {
    console.log('Payment completed:', data);
    showNotification(`Payment of $${data.amount} received for bill #${data.bill_id}`, 'success');
});

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // You can integrate with your preferred notification library
    // This is a basic example using the browser's notification API
    if (Notification.permission === 'granted') {
        new Notification('MediVerse Update', {
            body: message,
            icon: '/images/logo.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('MediVerse Update', {
                    body: message,
                    icon: '/images/logo.png'
                });
            }
        });
    }

    // Example using Toastr if available
    if (typeof toastr !== 'undefined') {
        toastr[type](message);
    }
}

// Request notification permission when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
});
