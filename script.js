/* =========================
   DATA JADWAL
========================= */

let jadwalDefault = [

    {
        id: 1,
        tanggal: "2026-07-25",
        waktu: "20:00",
        acara: "Undangan Habsyi",
        lokasi: "Banjarmasin",
        pengundang: "Ahmad Fauzi",
        maps: "https://maps.google.com",
        whatsapp: "6281234567890"
    },

    {
        id: 2,
        tanggal: "2026-08-01",
        waktu: "20:00",
        acara: "Majelis Shalawat",
        lokasi: "Martapura",
        pengundang: "Muhammad Ridwan",
        maps: "https://maps.google.com",
        whatsapp: "6281234567890"
    }

];


let jadwal =

    JSON.parse(

        localStorage.getItem(
            "jadwalSafinatussurur"
        )

    )

    ||

    jadwalDefault;


/* =========================
   ELEMENT HTML
========================= */

const scheduleList =
    document.getElementById(
        "scheduleList"
    );


const upcomingCard =
    document.getElementById(
        "upcomingCard"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const countEvent =
    document.getElementById(
        "countEvent"
    );


const filterBtn =
    document.getElementById(
        "filterBtn"
    );


const filterMenu =
    document.getElementById(
        "filterMenu"
    );


const detailModal =
    document.getElementById(
        "detailModal"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


const addScheduleBtn =
    document.getElementById(
        "addScheduleBtn"
    );


const addScheduleModal =
    document.getElementById(
        "addScheduleModal"
    );


const closeAddModal =
    document.getElementById(
        "closeAddModal"
    );


const scheduleForm =
    document.getElementById(
        "scheduleForm"
    );


const downloadAllBtn =
document.getElementById("downloadAllBtn");

const downloadIconBtn =
document.getElementById("downloadIconBtn");


const downloadTemplate =
    document.getElementById(
        "downloadTemplate"
    );


const downloadScheduleList =
    document.getElementById(
        "downloadScheduleList"
    );


let filterAktif = "semua";


/* =========================
   FORMAT TANGGAL
========================= */

function formatTanggal(tanggal) {

    const date =
        new Date(
            tanggal + "T00:00:00"
        );


    const bulan = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"

    ];


    return {

        tanggal:
            date.getDate(),

        bulan:
            bulan[date.getMonth()]

    };

}


/* =========================
   FORMAT TANGGAL DOWNLOAD
========================= */

function formatTanggalLengkap(tanggal) {

    const date =
        new Date(
            tanggal + "T00:00:00"
        );


    const bulan = [

        "JANUARI",
        "FEBRUARI",
        "MARET",
        "APRIL",
        "MEI",
        "JUNI",
        "JULI",
        "AGUSTUS",
        "SEPTEMBER",
        "OKTOBER",
        "NOVEMBER",
        "DESEMBER"

    ];


    return {

        tanggal:
            date.getDate(),

        bulan:
            bulan[date.getMonth()],

        tahun:
            date.getFullYear()

    };

}


/* =========================
   STATUS JADWAL
========================= */

function getStatus(item) {

    const sekarang =
        new Date();


    const tanggalAcara =
        new Date(

            `${item.tanggal}T${item.waktu}:00`

        );


    return tanggalAcara >= sekarang

        ? "akan-datang"

        : "selesai";

}


/* =========================
   RENDER ACARA TERDEKAT
========================= */

function renderUpcoming() {

    const acaraMendatang =

        jadwal

            .filter(

                item =>

                    getStatus(item)

                    ===

                    "akan-datang"

            )


            .sort(

                (a, b) =>

                    new Date(

                        `${a.tanggal}T${a.waktu}`

                    )

                    -

                    new Date(

                        `${b.tanggal}T${b.waktu}`

                    )

            );


    countEvent.textContent =

        `${acaraMendatang.length} Acara`;


    if (

        acaraMendatang.length === 0

    ) {

        upcomingCard.innerHTML = `

            <p>

                Tidak ada acara mendatang.

            </p>

        `;


        return;

    }


    const item =
        acaraMendatang[0];


    const tanggal =
        formatTanggal(
            item.tanggal
        );


    upcomingCard.innerHTML = `

        <div class="upcoming-label">

            ACARA TERDEKAT

        </div>


        <div class="upcoming-main">


            <div class="upcoming-date">

                <strong>

                    ${tanggal.tanggal}

                </strong>


                <span>

                    ${tanggal.bulan}

                </span>

            </div>


            <div class="upcoming-info">


                <h4>

                    ${item.acara}

                </h4>


                <p>

                    <i class="fa-solid fa-clock"></i>

                    ${item.waktu} WITA

                </p>


                <p>

                    <i class="fa-solid fa-location-dot"></i>

                    ${item.lokasi}

                </p>


                <p>

                    <i class="fa-solid fa-user"></i>

                    ${item.pengundang}

                </p>


            </div>


        </div>

    `;

}


/* =========================
   RENDER SEMUA JADWAL
========================= */

function renderJadwal() {

    const keyword =

        searchInput.value

            .toLowerCase();


    const hasil =

        jadwal

            .filter(item => {


                const status =
                    getStatus(item);


                const cocokFilter =

                    filterAktif

                    ===

                    "semua"

                    ||

                    status

                    ===

                    filterAktif;


                const cocokSearch =

                    item.acara

                        .toLowerCase()

                        .includes(

                            keyword

                        )

                    ||

                    item.lokasi

                        .toLowerCase()

                        .includes(

                            keyword

                        )

                    ||

                    item.pengundang

                        .toLowerCase()

                        .includes(

                            keyword

                        );


                return (

                    cocokFilter

                    &&

                    cocokSearch

                );

            })


            .sort(

                (a, b) =>

                    new Date(

                        `${a.tanggal}T${a.waktu}`

                    )

                    -

                    new Date(

                        `${b.tanggal}T${b.waktu}`

                    )

            );


    scheduleList.innerHTML = "";


    if (

        hasil.length === 0

    ) {

        emptyState.style.display =
            "block";


        return;

    }


    emptyState.style.display =
        "none";


    hasil.forEach(item => {


        const tanggal =

            formatTanggal(

                item.tanggal

            );


        const status =

            getStatus(item);


        const statusText =

            status === "akan-datang"

                ? "Akan Datang"

                : "Selesai";


        const card =

            document.createElement(

                "div"

            );


        card.className =
            "schedule-card";


        card.innerHTML = `


            <div class="date-box">


                <strong>

                    ${tanggal.tanggal}

                </strong>


                <span>

                    ${tanggal.bulan}

                </span>


            </div>


            <div class="event-info">


                <h4>

                    ${item.acara}

                </h4>


                <p>

                    <i class="fa-solid fa-clock"></i>

                    ${item.waktu} WITA

                </p>


                <p>

                    <i class="fa-solid fa-location-dot"></i>

                    ${item.lokasi}

                </p>


                <span

                    class="event-status

                    ${

                        status === "selesai"

                            ? "finished"

                            : ""

                    }"

                >

                    ${statusText}

                </span>


            </div>


            <button

                class="detail-btn"

                onclick="openDetail(${item.id})"

            >

                <i

                    class="fa-solid fa-chevron-right"

                ></i>


            </button>

        `;


        scheduleList.appendChild(

            card

        );

    });

}


/* =========================
   DETAIL JADWAL
========================= */

function openDetail(id) {

    const item =

        jadwal.find(

            data =>

                data.id === id

        );


    if (!item) return;


    const tanggal =

        formatTanggal(

            item.tanggal

        );


    document.getElementById(

        "modalTitle"

    ).textContent =

        item.acara;


    document.getElementById(

        "modalDetails"

    ).innerHTML = `


        <div class="detail-row">

            <i class="fa-solid fa-calendar"></i>

            ${tanggal.tanggal}

            ${tanggal.bulan}

            ${item.tanggal.substring(0, 4)}

        </div>


        <div class="detail-row">

            <i class="fa-solid fa-clock"></i>

            ${item.waktu} WITA

        </div>


        <div class="detail-row">

            <i class="fa-solid fa-location-dot"></i>

            ${item.lokasi}

        </div>


        <div class="detail-row">

            <i class="fa-solid fa-user"></i>

            ${item.pengundang}

        </div>

    `;


    document.getElementById(

        "modalMaps"

    ).href = item.maps;


    const pesan =

        `Assalamu'alaikum, kami dari Grup Habsyi Safinatussurur ingin mengonfirmasi undangan ${item.acara} pada tanggal ${item.tanggal}.`;


    document.getElementById(

        "modalWhatsapp"

    ).href =

        `https://wa.me/${

            item.whatsapp

        }?text=${

            encodeURIComponent(

                pesan

            )

        }`;


    detailModal.classList.add(

        "show"

    );

}


/* =========================
   TUTUP DETAIL MODAL
========================= */

closeModal.addEventListener(

    "click",

    () => {

        detailModal.classList.remove(

            "show"

        );

    }

);


detailModal.addEventListener(

    "click",

    event => {

        if (

            event.target

            ===

            detailModal

        ) {

            detailModal.classList.remove(

                "show"

            );

        }

    }

);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(

    "input",

    renderJadwal

);


/* =========================
   FILTER BUTTON
========================= */

filterBtn.addEventListener(

    "click",

    () => {

        filterMenu.classList.toggle(

            "show"

        );

    }

);


/* =========================
   FILTER
========================= */

document

    .querySelectorAll(

        ".filter"

    )

    .forEach(

        button => {


            button.addEventListener(

                "click",

                () => {


                    document

                        .querySelectorAll(

                            ".filter"

                        )

                        .forEach(

                            btn =>

                                btn.classList.remove(

                                    "active"

                                )

                        );


                    button.classList.add(

                        "active"

                    );


                    filterAktif =

                        button.dataset.filter;


                    renderJadwal();

                }

            );

        }

    );


/* =========================
   BUKA TAMBAH JADWAL
========================= */

addScheduleBtn.addEventListener(

    "click",

    () => {

        addScheduleModal.classList.add(

            "show"

        );

    }

);


/* =========================
   TUTUP TAMBAH JADWAL
========================= */

closeAddModal.addEventListener(

    "click",

    () => {

        addScheduleModal.classList.remove(

            "show"

        );

    }

);


/* =========================
   SIMPAN JADWAL BARU
========================= */

scheduleForm.addEventListener(

    "submit",

    function(event) {


        event.preventDefault();


        const jadwalBaru = {


            id:

                Date.now(),


            acara:

                document.getElementById(

                    "acaraInput"

                ).value,


            tanggal:

                document.getElementById(

                    "tanggalInput"

                ).value,


            waktu:

                document.getElementById(

                    "waktuInput"

                ).value,


            lokasi:

                document.getElementById(

                    "lokasiInput"

                ).value,


            pengundang:

                document.getElementById(

                    "pengundangInput"

                ).value,


            maps:

                document.getElementById(

                    "mapsInput"

                ).value

                ||

                "https://maps.google.com",


            whatsapp:

                document.getElementById(

                    "whatsappInput"

                ).value

        };


        jadwal.push(

            jadwalBaru

        );


        localStorage.setItem(

            "jadwalSafinatussurur",

            JSON.stringify(

                jadwal

            )

        );


        scheduleForm.reset();


        addScheduleModal.classList.remove(

            "show"

        );


        renderUpcoming();


        renderJadwal();


        alert(

            "Jadwal berhasil ditambahkan!"

        );

    }

);


/* =========================
   FORMAT JADWAL UNTUK DOWNLOAD
========================= */

function renderDownloadSchedule() {


    const sekarang =

        new Date();


    const jadwalAkanDatang =

        jadwal

            .filter(item => {


                const tanggalAcara =

                    new Date(

                        `${item.tanggal}T${item.waktu}:00`

                    );


                return (

                    tanggalAcara

                    >=

                    sekarang

                );

            })


            .sort(

                (a, b) =>

                    new Date(

                        `${a.tanggal}T${a.waktu}`

                    )

                    -

                    new Date(

                        `${b.tanggal}T${b.waktu}`

                    )

            );


    downloadScheduleList.innerHTML = "";


    if (

        jadwalAkanDatang.length === 0

    ) {


        downloadScheduleList.innerHTML = `

            <div class="download-empty">

                Tidak ada jadwal yang akan datang.

            </div>

        `;


        return false;

    }


    jadwalAkanDatang.forEach(

        item => {


            const tanggal =

                formatTanggalLengkap(

                    item.tanggal

                );


            downloadScheduleList.innerHTML += `


                <div class="download-item">


                    <div class="download-date">


                        <strong>

                            ${tanggal.tanggal}

                        </strong>


                        <span>

                            ${tanggal.bulan}

                        </span>


                    </div>


                    <div class="download-info">


                        <h2>

                            ${item.acara}

                        </h2>


                        <p>

                            ⏰ ${item.waktu} WITA

                        </p>


                        <p>

                            📍 ${item.lokasi}

                        </p>


                        <p>

                            👤 ${item.pengundang}

                        </p>


                    </div>


                </div>

            `;

        }

    );


    return true;

}


/* =========================
   DOWNLOAD SEMUA JADWAL
========================= */

async function downloadSemuaJadwal() {


    const adaJadwal =

        renderDownloadSchedule();


    if (

        !adaJadwal

    ) {

        alert(

            "Tidak ada jadwal yang akan datang."

        );


        return;

    }


    try {


        const canvas =

            await html2canvas(

                downloadTemplate,

                {

                    scale: 2,

                    useCORS: true,

                    backgroundColor:

                        "#ffffff"

                }

            );


        const link =

            document.createElement(

                "a"

            );


        const tanggalHariIni =

            new Date()

                .toISOString()

                .split("T")[0];


        link.download =

            `Jadwal-Habsyi-Safinatussurur-${tanggalHariIni}.png`;


        link.href =

            canvas.toDataURL(

                "image/png"

            );


        link.click();


    }


    catch (error) {


        console.error(

            error

        );


        alert(

            "Gagal membuat gambar jadwal."

        );

    }

}


/* =========================
   EVENT DOWNLOAD
========================= */

downloadAllBtn.addEventListener(

    "click",

    downloadSemuaJadwal

);


/* =========================
   JALANKAN APLIKASI
========================= */

renderUpcoming();

renderJadwal();