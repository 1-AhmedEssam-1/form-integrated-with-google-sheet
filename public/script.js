const form = document.getElementById("bookingForm");
const table = document.getElementById("bookingTable");
const searchInput = document.getElementById("searchInput");
const searchDate = document.getElementById("searchDate");
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

        const response = await fetch("/api/bookings", {
            method: "POST",
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
async function loadBookings(search="", date = ""){


    const response = await fetch(
        `/api/bookings/today?search=${encodeURIComponent(search)}&date=${date}`
    );
    const bookings = await response.json();


    table.innerHTML = "";


    bookings.forEach(booking => {

        table.innerHTML += `

        <tr>
            <td>${booking[0]}</td>
            <td>${booking[1]}</td>
            <td>${booking[2]}</td>
            <td>${booking[3]}</td>
            <td>${booking[4]}</td>
            <td>${booking[5]}</td>

          
            <td>${booking[6]}</td>
            <td>${booking[7]}</td>
            <td>${booking[8]}</td>
        </tr>

        `;

    });

}
function formatDate(date) {

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;

}
searchDate.addEventListener("change", () => {

    loadBookings(
        searchInput.value,
        searchDate.value
    );

});
searchInput.addEventListener("input", () => {

    loadBookings(searchInput.value);

});


loadBookings();
