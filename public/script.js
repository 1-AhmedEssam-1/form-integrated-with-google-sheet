const form = document.getElementById("bookingForm");
const table = document.getElementById("bookingTable");
const searchInput = document.getElementById("searchInput");
const searchDate = document.getElementById("searchDate");
let editingRow = null;
let currentBookings = [];
let currentSearch = "";
let currentDate = "";
const modal = document.getElementById("detailsModal");
const bookingDetails = document.getElementById("bookingDetails");
const closeModal = document.getElementById("closeModal");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const bookingCount = document.getElementById("bookingCount");
const downloadPdfBtn =
    document.getElementById("downloadPdfBtn");
const downloadReportBtn =
    document.getElementById("downloadReportBtn");
const colorModal = document.getElementById("colorModal");

let coloringRow = null;

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const booking = {
        tb3: document.getElementById("tb3").value,
        phone: document.getElementById("phone").value,
        name: document.getElementById("name").value,
        t7seel: document.getElementById("t7seel").value,
        nights: document.getElementById("nights").value,
        rooms: document.getElementById("rooms").value,
        bookingDate: formatDate(document.getElementById("date1").value),
        //registrationDate: formatDate(document.getElementById("date2").value),
        notes: document.getElementById("notes").value
    };

    try {


        let url = "/api/bookings";
        let method = "POST";

        if (editingRow !== null) {

            url = `/api/bookings/${editingRow}`;
            method = "PUT";

        }


        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(booking)
        });

        const result = await response.json();

        if (response.ok) {

            //addBooking(booking);

            alert(result.message);

            form.reset();
            editingRow = null;

            form.querySelector("button").textContent = "Submit";

            loadBookings(
                currentSearch,
                currentDate
            );


        } else {

            alert(result.message || "Something went wrong.");

        }

    } catch (error) {

        console.error(error);
        alert("Cannot connect to the server.");

    }

});


function addBooking(data) {

    table.innerHTML += `
        <tr>
            <td>${data.tb3}</td>
            <td>${data.phone}</td>
            <td>${data.name}</td>
            <td>${data.t7seel}</td>
            <td>${data.nights}</td>
            <td>${data.rooms}</td>
            <td>${data.bookingDate}</td>
            <td>${data.registrationDate}</td>
        </tr>
    `;
}
async function loadBookings(search = "", date = "") {


    const response = await fetch(
        `/api/bookings/today?search=${encodeURIComponent(search)}&date=${date}`
    );
    const bookings = await response.json();
    console.log(bookings);

    currentBookings = bookings;
    bookingCount.textContent = bookings.length;


    table.innerHTML = "";


    bookings.forEach((booking, index) => {
        // const rowNumber = index + 2;

        let rowClass = "";

        // Automatic highlight
       if(
                booking.data[5] &&
                booking.data[5].includes("تمليك")
            ){
                rowClass="ownership-row";
            }
        const savedColor = booking.data[9];

        if (savedColor) {

            rowClass = savedColor;

        }
    

        table.innerHTML += `

        <tr  class="${rowClass}">
            <td>${booking.data[0]}</td>
            <td>${booking.data[1]}</td>
            <td>${booking.data[2]}</td>
            <td>${booking.data[3]}</td>
            <td>${booking.data[4]}</td>
            <td>${booking.data[5]}</td>

       
            <td>${booking.data[6]}</td>
            <td>${booking.data[7]}</td>
            <td>${booking.data[8]}</td>
            <td>
                <button
                    class="view-btn"
                    onclick="viewBooking(${booking.rowNumber})">
                    👁️
                </button>
                <button
                    class="color-btn"
                    onclick="showColorPicker(${booking.rowNumber})">
                    🎨
                </button>



                <button
                    class="edit-btn"
                    onclick="editBooking(${booking.rowNumber})">
                    ✏️
                </button>


                <button 
                    class="delete-btn"
                    onclick="deleteBooking(${booking.rowNumber})">

                    🗑️

                </button>
                
                <button
                    class="whatsapp-btn"
                    onclick="sendWhatsApp(${booking.rowNumber})">
                    📱
                </button>


            </td>
        </tr>

        `;

});

}
function sendWhatsApp(rowNumber) {

    const booking = currentBookings.find(
        b => b.rowNumber === rowNumber
    );

    if (!booking) {
        alert("Booking not found.");
        return;
    }

    const managerPhone = "+201026498803"; // <-- Replace with your number

    const message = `

الاسم: ${booking.data[2]}
عدد الشاليهات: ${booking.data[6]}`;

    window.open(
        `https://wa.me/${managerPhone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
}
function formatDate(date) {

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;

}
searchDate.addEventListener("change", () => {

    currentDate = searchDate.value;

    loadBookings(
        currentSearch,
        currentDate
    );

});
searchInput.addEventListener("input", () => {

    currentSearch = searchInput.value;

    loadBookings(
        currentSearch,
        currentDate
    );

});


loadBookings();
async function deleteBooking(row) {


    const confirmDelete = confirm(
        "Are you sure you want to delete this booking?"
    );


    if (!confirmDelete)
        return;



    const response = await fetch(
        `/api/bookings/${row}`,
        {
            method: "DELETE"
        }
    );


    const result = await response.json();


    alert(result.message);


    loadBookings(
        currentSearch,
        currentDate
    );


}


function editBooking(rowNumber) {

    // Find the booking that matches the clicked row
    const booking = currentBookings.find(
        b => b.rowNumber === rowNumber
    );

    if (!booking)
        return;

    // Save which row we're editing
    editingRow = rowNumber;

    // Fill every field
    document.getElementById("tb3").value = booking.data[0];
    document.getElementById("phone").value = booking.data[1];
    document.getElementById("name").value = booking.data[2];
    document.getElementById("t7seel").value = booking.data[3];
    document.getElementById("nights").value = booking.data[4];
    document.getElementById("notes").value = booking.data[5];
    document.getElementById("rooms").value = booking.data[6];

    // Convert DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = booking.data[7].split("/");

    document.getElementById("date1").value =
        `${year}-${month}-${day}`;

    // Change button text/////////////////////////////////////////
    // Change button text
    submitBtn.textContent = "Update";


    // Show cancel button
    cancelEditBtn.style.display = "inline-block";


    // Scroll to booking form
    document.querySelector(".form-card").scrollIntoView({

        behavior: "smooth"

    });


    // Highlight the form
    const formCard = document.querySelector(".form-card");

    formCard.classList.add("editing-form");


    setTimeout(() => {

        formCard.classList.remove("editing-form");

    }, 1000);

}

function viewBooking(rowNumber) {


    const booking = currentBookings.find(
        b => b.rowNumber === rowNumber
    );


    if (!booking)
        return;



    bookingDetails.innerHTML = `

    <p><b>Tb3:</b> ${booking.data[0]}</p>

    <p><b>Phone:</b> ${booking.data[1]}</p>

    <p><b>Name:</b> ${booking.data[2]}</p>

    <p><b>T7seel:</b> ${booking.data[3]}</p>

    <p><b>Nights:</b> ${booking.data[4]}</p>

    <p><b>Notes:</b> ${booking.data[5]}</p>

    <p><b>Rooms:</b> ${booking.data[6]}</p>

    <p><b>Date:</b> ${booking.data[7]}</p>

    <p><b>Registration:</b> ${booking.data[8]}</p>

    `;


    modal.style.display = "flex";

}
closeModal.onclick = function () {

    modal.style.display = "none";

};


window.onclick = function (e) {

    if (e.target === modal) {

        modal.style.display = "none";

    }

};
cancelEditBtn.addEventListener("click", () => {


    // Remove editing mode
    editingRow = null;


    // Clear form
    form.reset();


    // Return button text
    submitBtn.textContent = "Submit";


    // Hide cancel button
    cancelEditBtn.style.display = "none";


});



/////////////////////////////
downloadReportBtn.addEventListener("click", async () => {

    // Get only the booking table
    const originalTable = document.querySelector(".table-card table");

    // Create a clean temporary report container
    const reportContainer = document.createElement("div");

    reportContainer.style.position = "absolute";
    reportContainer.style.left = "-10000px";
    reportContainer.style.top = "0";

    reportContainer.style.display = "inline-block";
    reportContainer.style.width = "max-content";

    reportContainer.style.background = "#ffffff";
    reportContainer.style.color = "#000000";

    reportContainer.style.padding = "20px";

    reportContainer.style.fontFamily =
        "Arial, Helvetica, sans-serif";


    // ============================
    // Report title
    // ============================

    const title = document.createElement("h2");

    title.textContent =
        `Today's Bookings (${currentBookings.length})`;

    title.style.margin = "0 0 20px 0";
    title.style.color = "#000";
    title.style.textAlign = "left";


    reportContainer.appendChild(title);


    // ============================
    // Clone table
    // ============================

    const clonedTable =
        originalTable.cloneNode(true);


    // Make table only as wide as its actual content
    clonedTable.style.width = "max-content";
    clonedTable.style.minWidth = "0";
    clonedTable.style.margin = "0";
    clonedTable.style.borderCollapse = "collapse";
    clonedTable.style.background = "#ffffff";


    // ============================
    // Remove Actions column
    // ============================

    const rows =
        clonedTable.querySelectorAll("tr");

    rows.forEach(row => {

        const cells = row.children;

        if (cells.length > 0) {

            // Last column is Actions
            cells[cells.length - 1].remove();

        }

    });


    // ============================
    // Style table cells
    // ============================

    const headers =
        clonedTable.querySelectorAll("th");

    headers.forEach(th => {

        th.style.padding = "10px";
        th.style.background = "#673ab7";
        th.style.color = "#ffffff";
        th.style.textAlign = "center";
        th.style.whiteSpace = "nowrap";
        th.style.fontSize = "14px";

    });


    const cells =
        clonedTable.querySelectorAll("td");

    cells.forEach(td => {

        td.style.padding = "10px";
        td.style.textAlign = "center";
        td.style.whiteSpace = "nowrap";
        td.style.fontSize = "13px";
        td.style.borderBottom =
            "1px solid #dddddd";

    });


    // Phone column smaller
    clonedTable.querySelectorAll(
        "th:nth-child(2), td:nth-child(2)"
    ).forEach(cell => {

        cell.style.fontSize = "11px";

    });


    reportContainer.appendChild(clonedTable);


    // Put temporary report in the page
    document.body.appendChild(reportContainer);


    try {

        // Wait a moment for browser to calculate dimensions
        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );


        // ============================
        // Screenshot ONLY report
        // ============================

        const canvas =
            await html2canvas(reportContainer, {

                scale: 2,

                useCORS: true,

                backgroundColor: "#ffffff",

                logging: false

            });


        // ============================
        // Download image
        // ============================

        const image =
            canvas.toDataURL("image/png");


        const link =
            document.createElement("a");


        link.download =
            "Bookings_Report.png";


        link.href = image;


        link.click();


    }
    catch (error) {

        console.error(
            "Error creating report:",
            error
        );

        alert(
            "Could not create the report image."
        );

    }
    finally {

        // Always remove temporary report
        reportContainer.remove();

    }

});

const themeToggle = document.getElementById("themeToggle");

// Restore saved mode
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";

}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";

    }

});
function showColorPicker(row) {

    coloringRow = row;

    colorModal.style.display = "block";

}
window.addEventListener("click", (e) => {

    if (e.target === colorModal) {

        colorModal.style.display = "none";

    }

});
async function setRowColor(color){

    if(coloringRow === null)
        return;


    const response = await fetch(
        `/api/bookings/color/${coloringRow}`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                color:color
            })
        }
    );


    const result = await response.json();


    alert(result.message);


    colorModal.style.display="none";


    // reload with same search/date
    loadBookings(
        currentSearch,
        currentDate
    );


    coloringRow = null;

}
downloadPdfBtn.addEventListener("click", () => {

    const url =
    `/report.html?search=${encodeURIComponent(currentSearch)}&date=${currentDate}`;


    window.open(url, "_blank");

});
function hideColumn(columnNumber) {

    const bookingTable =
        document.querySelector(".table-card table");

    bookingTable
        .querySelectorAll(
            `tr > *:nth-child(${columnNumber})`
        )
        .forEach(cell => {

            cell.style.display = "none";

        });
}

document
    .getElementById("showColumnsBtn")
    .addEventListener("click", () => {

        document
            .querySelectorAll(".table-card table th, .table-card table td")
            .forEach(cell => {
                cell.style.display = "";
            });

    });