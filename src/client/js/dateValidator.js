function validateDate() {
    let testDate = new Date(document.getElementById('start').value);
    // 1 day offset for timezones
    testDate.setDate(testDate.getDate() + 1);
    if (
        testDate.toString() !== 'Invalid Date' &&
        testDate >= new Date().setHours(0, 0, 0, 0)
    ) {
        // Valid Date UI
        document.getElementById('error-message').innerHTML = "";
        document.getElementById('generate').disabled = false;

        return true;
    } else {
        // Invalid Date UI
        document.getElementById('error-message').innerHTML = "Invalid Date";
        document.getElementById('generate').disabled = true;

        return false;
    }
}

function validateDateRange() {
    const startDate = new Date(document.getElementById('start').value);
    const endDate = new Date(document.getElementById('end').value);

    if (
        startDate.toString() !== 'Invalid Date' &&
        endDate.toString() !== 'Invalid Date' &&
        endDate >= startDate
    ) {
        // Valid Date UI
        document.getElementById('error-message').innerHTML = "";
        document.getElementById('generate').disabled = false;

        return true;
    } else {
        // Invalid Date UI
        document.getElementById('error-message').innerHTML = "Invalid Date (Range)";
        document.getElementById('generate').disabled = true;

        return false;
    }
}

export { validateDate, validateDateRange }
