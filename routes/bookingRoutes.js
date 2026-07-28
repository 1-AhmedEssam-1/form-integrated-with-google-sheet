const express = require("express");
const router = express.Router();

const sheets = require("../services/googleSheets");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Sheet1";

router.post("/", async (req, res) => {

    try {

        const booking = req.body;
        const now = new Date();

        const registrationDate =
            `${String(now.getDate()).padStart(2, "0")}/` +
            `${String(now.getMonth() + 1).padStart(2, "0")}/` +
            `${now.getFullYear()} ` +
            `${String(now.getHours()).padStart(2, "0")}:` +
            `${String(now.getMinutes()).padStart(2, "0")}`;

        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: `${SHEET_NAME}!A:I`,

            valueInputOption: "USER_ENTERED",

            requestBody: {

                values: [[
                    booking.tb3,
                    booking.phone,
                    booking.name,
                    booking.t7seel,
                    booking.nights,
                    booking.notes,
                    booking.rooms,
                    booking.bookingDate,
                    registrationDate
                    // booking.notes
                ]]

            }

        });

        res.status(201).json({
            success: true,
            message: "Booking saved successfully!"
        });

    } catch (error) {

        console.error(error.message);
        console.log("teez")

        res.status(500).json({
            success: false,
            message: "Failed to save booking."
        });

    }

});
router.get("/today", async (req, res) => {

    try {

        const response = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:I`

        });


        let bookings = response.data.values;


        // Add real Google Sheet row number



        if (!bookings || bookings.length === 0) {
            return res.json([]);
        }


        bookings = bookings.map((row, index) => {

            return {
                rowNumber: index + 1,
                data: row
            };

        });

        bookings.shift();


        const search = req.query.search;
        const date = req.query.date;



        // ==========================
        // DATE FILTER
        // ==========================

        if (date) {

            // HTML date input gives: 2026-07-30

            const parts = date.split("-");


            const formattedDate =
                `${parts[2]}/${parts[1]}/${parts[0]}`;


            console.log("Calendar date:", date);
            console.log("Converted date:", formattedDate);



            bookings = bookings.filter(row => {


                const sheetDate = String(row.data[7]).trim();


                console.log(
                    "Comparing sheet:",
                    sheetDate,
                    "with:",
                    formattedDate
                );


                return sheetDate === formattedDate;


            });


        }


        // ==========================
        // NO DATE SELECTED
        // SHOW TODAY ONLY
        // ==========================

        else if (!search || search.trim() === "") {


            const today = new Date();


            const todayString =
                `${String(today.getDate()).padStart(2, "0")}/` +
                `${String(today.getMonth() + 1).padStart(2, "0")}/` +
                `${today.getFullYear()}`;



            console.log("Today's date:", todayString);



            bookings = bookings.filter(row => {


                const bookingDate = String(row.data[7]).trim();


                console.log("Checking:", bookingDate);


                return bookingDate === todayString;


            });

        }



        // ==========================
        // SEARCH
        // SEARCH WHOLE RESULT
        // ==========================

        if (search && search.trim() !== "") {


            const searchValue = search.trim();



            bookings = bookings.filter(row => {


                const tb3 = row.data[0] || "";
                const phone = row.data[1] || "";
                const name = row.data[2] || "";



                return (

                    tb3.includes(searchValue) ||
                    phone.includes(searchValue) ||
                    name.includes(searchValue)

                );


            });


        }



        console.log("Found:", bookings.length);



        res.json(bookings);



    } catch (error) {


        console.error("Read Sheet Error:");
        console.error(error);



        res.status(500).json({

            message: "Failed to read bookings"

        });


    }

});






router.delete("/:row", async (req, res) => {


    try {
        const row = Number(req.params.row);
        await sheets.spreadsheets.batchUpdate({

            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 966264468,
                                dimension: "ROWS",
                                startIndex: row - 1,
                                endIndex: row

                            }
                        }
                    }
                ]
            }

        });

        res.json({
            message: "Booking deleted successfully"
        });

    }

    catch (error) {

        console.log(error.message);
        res.status(500).json({
            message: "Delete failed"
        });
    }

});











module.exports = router;