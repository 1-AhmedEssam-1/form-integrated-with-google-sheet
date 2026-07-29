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

const downloadReportBtn =
    document.getElementById("downloadReportBtn");
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

        if (booking.data[5].includes("تمليك")) {
            rowClass = "ownership-row";
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
                    class="edit-btn"
                    onclick="editBooking(${booking.rowNumber})">
                    ✏️
                </button>


                <button 
                    class="delete-btn"
                    onclick="deleteBooking(${booking.rowNumber})">

                    🗑️

                </button>


            </td>
        </tr>

        `;

    });

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

    const tableCard = document.querySelector(".table-card");

    const canvas = await html2canvas(tableCard, {

        scale: 2,
        useCORS: true

    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");

    link.download = "Bookings_Report.png";

    link.href = image;

    link.click();

});