const express = require("express");
const router = express.Router();

const sheets = require("../services/googleSheets");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Sheet1";

router.post("/", async (req, res) => {

    try {

        const booking = req.body;
        const now = new Date();

        const registrationDate = now.toLocaleString("en-GB", {
            timeZone: "Africa/Cairo",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
        await sheets.spreadsheets.values.append({

            spreadsheetId: SPREADSHEET_ID,

            range: `${SHEET_NAME}!A:J`,

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
                    registrationDate,
                    ""
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
            range: `${SHEET_NAME}!A:J`

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


            const todayString = new Date()
                .toLocaleDateString("en-GB", {
                    timeZone: "Africa/Cairo"
                });

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
                const notes = row.data[5] || "";




                return (

                    tb3.includes(searchValue) ||
                    notes.includes(searchValue) ||
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




router.put("/color/:row", async(req,res)=>{

    try{

        const row = Number(req.params.row);
        const color = req.body.color;


        // Save color name in column J
        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range:`${SHEET_NAME}!J${row}`,

            valueInputOption:"USER_ENTERED",

            requestBody:{
                values:[
                    [color]
                ]
            }

        });



        // Convert color name to Google Sheet RGB
        let rgb = {
            red:1,
            green:1,
            blue:1
        };


        if(color === "green"){

            rgb = {
                red:0.49,
                green:0.85,
                blue:0.34
            };

        }

        else if(color === "yellow"){

            rgb = {
                red:1,
                green:0.85,
                blue:0.24
            };

        }

        else if(color === "red"){

            rgb = {
                red:1,
                green:0.36,
                blue:0.36
            };

        }

        else if(color === "blue"){

            rgb = {
                red:0.3,
                green:0.65,
                blue:0.95
            };

        }



        // Color the whole row
        await sheets.spreadsheets.batchUpdate({

            spreadsheetId: SPREADSHEET_ID,

            requestBody:{

                requests:[

                    {

                    repeatCell:{

                        range:{

                            sheetId: 966264468,

                            startRowIndex: row - 1,

                            endRowIndex: row,

                            startColumnIndex: 0,

                            endColumnIndex: 10

                        },


                        cell:{
                            userEnteredFormat:{
                                backgroundColor: rgb
                            }
                        },


                        fields:
                        "userEnteredFormat.backgroundColor"

                    }

                    }

                ]

            }

        });



        res.json({

            message:"Color saved successfully"

        });



    }catch(error){

        console.log(error);

        res.status(500).json({

            message:"Color update failed"

        });

    }

});


// ======================================================
// UPDATE BOOKING
// PUT /api/bookings/:row
// ======================================================

router.put("/:row", async (req, res) => {

    try {

        // STEP 1: Get the Google Sheet row number
        const row = Number(req.params.row);

        // STEP 2: Get the updated booking data from the frontend
        const booking = req.body;

        // STEP 3: Read the existing row
        // We only need it to keep the original registration date.
        const oldRow = await sheets.spreadsheets.values.get({

            spreadsheetId: SPREADSHEET_ID,

            range: `${SHEET_NAME}!A${row}:I${row}`

        });

        // STEP 4: Keep the old registration date
        const registrationDate = oldRow.data.values[0][8];

        // STEP 5: Update the row
        await sheets.spreadsheets.values.update({

            spreadsheetId: SPREADSHEET_ID,

            range: `${SHEET_NAME}!A${row}:I${row}`,

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
                ]]

            }

        });

        // STEP 6: Success
        res.json({

            message: "Booking updated successfully"

        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Update failed"

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