// On form submission, save data to localStorage
document.getElementById('habit-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Existing code to add the row
    // ...
    
    // Save to localStorage
    const habitData = {
        date: date,
        cycling: cycling,
        reading: reading,
        coding: coding,
        yoga: yoga,
        comments: comments
    };
    
    let habitList = JSON.parse(localStorage.getItem('habitList')) || [];
    habitList.push(habitData);
    localStorage.setItem('habitList', JSON.stringify(habitList));
    
    // Reload table from storage on page load
    function loadTable() {
        const habitList = JSON.parse(localStorage.getItem('habitList')) || [];
        habitList.forEach(habit => {
            const newRow = `<tr>
                <td>${habit.date}</td>
                <td>${habit.cycling}</td>
                <td>${habit.reading}</td>
                <td>${habit.coding}</td>
                <td>${habit.yoga}</td>
                <td>${habit.comments}</td>
            </tr>`;
            document.getElementById('habit-table-body').insertAdjacentHTML('beforeend', newRow);
        });
    }
    
    // Call loadTable on page load
    loadTable();
});
