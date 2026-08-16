// ==========================================
// JADWAL.JS
// SISTEM INFORMASI HABSYI SAFINATUSSURUR
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// ELEMENT
// ==========================================

const jadwalContainer =
    document.getElementById("jadwal-container");

const jadwalLoading =
    document.getElementById("jadwal-loading");

const jadwalEmpty =
    document.getElementById("jadwal-empty");

const jumlahJadwal =
    document.getElementById("jumlah-jadwal");

const filterButtons =
    document.querySelectorAll(".filter-btn");


// ==========================================
// DATA GLOBAL
// ==========================================

let semuaJadwal = [];

let filterAktif = "mendatang";


// ==========================================
// HARI INI
// ==========================================

function getHariIni() {

    const sekarang = new Date();

    return new Date(
        sekarang.getFullYear(),
        sekarang.getMonth(),
        sekarang.getDate()
    );

}


// ==========================================
// PARSE TANGGAL
// ==========================================

function parseTanggal(tanggal) {

    if (!tanggal) {
        return null;
    }


    // ======================================
    // JIKA FIRESTORE TIMESTAMP
    // ======================================

    if (
        typeof tanggal === "object" &&
        typeof tanggal.toDate === "function"
    ) {

        const hasil = tanggal.toDate();

        hasil.setHours(
            0,
            0,
            0,
            0
        );

        return hasil;

    }


    // ======================================
    // JIKA DATE OBJECT
    // ======================================

    if (tanggal instanceof Date) {

        const hasil =
            new Date(tanggal);

        hasil.setHours(
            0,
            0,
            0,
            0
        );

        return hasil;

    }


    // ======================================
    // FORMAT YYYY-MM-DD
    // ======================================

    const teks =
        String(tanggal).trim();


    const bagian =
        teks.split("-");


    if (
        bagian.length === 3
    ) {

        const tahun =
            Number(bagian[0]);

        const bulan =
            Number(bagian[1]) - 1;

        const hari =
            Number(bagian[2]);


        const hasil =
            new Date(
                tahun,
                bulan,
                hari
            );


        if (
            !isNaN(
                hasil.getTime()
            )
        ) {

            hasil.setHours(
                0,
                0,
                0,
                0
            );

            return hasil;

        }

    }


    // ======================================
    // FORMAT TANGGAL LAIN
    // ======================================

    const hasil =
        new Date(teks);


    if (
        isNaN(
            hasil.getTime()
        )
    ) {

        return null;

    }


    hasil.setHours(
        0,
        0,
        0,
        0
    );


    return hasil;

}


// ==========================================
// LOAD JADWAL FIREBASE
// ==========================================

async function loadJadwal() {

    try {

        console.log(
            "Memulai mengambil data jadwal..."
        );


        // ==================================
        // TAMPILKAN LOADING
        // ==================================

        if (jadwalLoading) {

            jadwalLoading.style.display =
                "block";

        }


        if (jadwalEmpty) {

            jadwalEmpty.style.display =
                "none";

        }


        if (jadwalContainer) {

            jadwalContainer.innerHTML =
                "";

        }


        // ==================================
        // AMBIL COLLECTION JADWAL
        // ==================================

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "jadwal"
                )
            );


        console.log(
            "Jumlah dokumen jadwal:",
            snapshot.size
        );


        semuaJadwal = [];


        // ==================================
        // BACA SETIAP DOKUMEN
        // ==================================

        snapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();


                console.log(
                    "Data jadwal:",
                    documentSnapshot.id,
                    data
                );


                // ==================================
                // FIELD TANGGAL
                // ==================================

                const tanggalValue =
                    data.Tanggal ||
                    data.tanggal ||
                    data.tanggalKegiatan;


                if (!tanggalValue) {

                    console.warn(
                        "Jadwal tidak memiliki tanggal:",
                        documentSnapshot.id
                    );

                    return;

                }


                const tanggal =
                    parseTanggal(
                        tanggalValue
                    );


                if (!tanggal) {

                    console.warn(
                        "Format tanggal tidak valid:",
                        tanggalValue
                    );

                    return;

                }


                // ==================================
                // MASUKKAN DATA
                // ==================================

                semuaJadwal.push({

                    id:
                        documentSnapshot.id,

                    ...data,

                    tanggalDate:
                        tanggal

                });

            }
        );


        // ==================================
        // URUTKAN BERDASARKAN TANGGAL
        // ==================================

        semuaJadwal.sort(
            (a, b) => {

                return (
                    a.tanggalDate -
                    b.tanggalDate
                );

            }
        );


        console.log(
            "Semua jadwal berhasil dibaca:",
            semuaJadwal
        );


        // ==================================
        // SEMBUNYIKAN LOADING
        // ==================================

        if (jadwalLoading) {

            jadwalLoading.style.display =
                "none";

        }


        // ==================================
        // JIKA TIDAK ADA DATA
        // ==================================

        if (
            semuaJadwal.length === 0
        ) {

            tampilkanKosong(
                "semua"
            );

            return;

        }


        // ==================================
        // TAMPILKAN JADWAL MENDATANG
        // ==================================

        renderJadwal(
            "mendatang"
        );


    }

    catch (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );


        if (jadwalLoading) {

            jadwalLoading.style.display =
                "none";

        }


        if (jadwalContainer) {

            jadwalContainer.innerHTML = `

                <div class="error-jadwal">

                    <h3>
                        ❌ Gagal Memuat Jadwal
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    }

}


// ==========================================
// FILTER
// ==========================================

filterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;


                console.log(
                    "Filter dipilih:",
                    filter
                );


                // ==============================
                // BUTTON ACTIVE
                // ==============================

                filterButtons.forEach(
                    (btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                // ==============================
                // SIMPAN FILTER
                // ==============================

                filterAktif =
                    filter;


                // ==============================
                // RENDER
                // ==============================

                renderJadwal(
                    filter
                );

            }
        );

    }
);


// ==========================================
// RENDER JADWAL
// ==========================================

function renderJadwal(filter) {

    if (!jadwalContainer) {
        return;
    }


    jadwalContainer.innerHTML =
        "";


    const hariIni =
        getHariIni();


    let dataTampil =
        [];


    // ======================================
    // SEMUA
    // ======================================

    if (
        filter === "semua"
    ) {

        dataTampil =
            [...semuaJadwal];

    }


    // ======================================
    // MENDATANG
    // ======================================

    else if (
        filter === "mendatang"
    ) {

        dataTampil =
            semuaJadwal.filter(
                (jadwal) => {

                    return (
                        jadwal.tanggalDate >=
                        hariIni
                    );

                }
            );

    }


    // ======================================
    // SELESAI
    // ======================================

    else if (
        filter === "selesai"
    ) {

        dataTampil =
            semuaJadwal.filter(
                (jadwal) => {

                    return (
                        jadwal.tanggalDate <
                        hariIni
                    );

                }
            );

    }


    // ======================================
    // URUTKAN
    // ======================================

    if (
        filter === "selesai"
    ) {

        dataTampil.sort(
            (a, b) => {

                return (
                    b.tanggalDate -
                    a.tanggalDate
                );

            }
        );

    }

    else {

        dataTampil.sort(
            (a, b) => {

                return (
                    a.tanggalDate -
                    b.tanggalDate
                );

            }
        );

    }


    // ======================================
    // JUMLAH
    // ======================================

    if (jumlahJadwal) {

        jumlahJadwal.textContent =
            `${dataTampil.length} kegiatan`;

    }


    // ======================================
    // KOSONG
    // ======================================

    if (
        dataTampil.length === 0
    ) {

        tampilkanKosong(
            filter
        );

        return;

    }


    if (jadwalEmpty) {

        jadwalEmpty.style.display =
            "none";

    }


    // ======================================
    // BUAT CARD
    // ======================================

    dataTampil.forEach(
        (jadwal) => {

            const card =
                buatCardJadwal(
                    jadwal
                );


            jadwalContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// PESAN KOSONG
// ==========================================

function tampilkanKosong(
    filter
) {

    if (!jadwalEmpty) {
        return;
    }


    jadwalEmpty.style.display =
        "block";


    const title =
        jadwalEmpty.querySelector(
            "h3"
        );

    const text =
        jadwalEmpty.querySelector(
            "p"
        );


    if (
        filter === "mendatang"
    ) {

        if (title) {

            title.textContent =
                "Belum Ada Jadwal Mendatang";

        }


        if (text) {

            text.textContent =
                "Saat ini belum ada kegiatan yang akan datang.";

        }

    }

    else if (
        filter === "selesai"
    ) {

        if (title) {

            title.textContent =
                "Belum Ada Jadwal Selesai";

        }


        if (text) {

            text.textContent =
                "Belum terdapat kegiatan yang telah selesai.";

        }

    }

    else {

        if (title) {

            title.textContent =
                "Belum Ada Jadwal";

        }


        if (text) {

            text.textContent =
                "Saat ini belum ada jadwal kegiatan.";

        }

    }


    if (jumlahJadwal) {

        jumlahJadwal.textContent =
            "0 kegiatan";

    }

}


// ==========================================
// BUAT CARD
// ==========================================

function buatCardJadwal(
    data
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "jadwal-card";


    // ======================================
    // DATA
    // ======================================

    const tanggal =
        data.tanggalDate;


    const namaHari =
        tanggal.toLocaleDateString(
            "id-ID",
            {
                weekday: "long"
            }
        );


    const tanggalLengkap =
        tanggal.toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const acara =
        data.Acara ||
        data.acara ||
        "Kegiatan Habsyi";


    const waktu =
        data.Waktu ||
        data.waktu ||
        "-";


    const lokasi =
        data.Lokasi ||
        data.lokasi ||
        "-";


    const pengundang =
        data.Pengundang ||
        data.pengundang ||
        "-";


    const maps =
        data.Maps ||
        data.maps ||
        "";


    const whatsapp =
        data.WhatsApp ||
        data.whatsapp ||
        "";


    // ======================================
    // STATUS
    // ======================================

    const hariIni =
        getHariIni();


    const sudahSelesai =
        tanggal < hariIni;


    const statusHTML =
        sudahSelesai

            ? `

                <span
                    class="status-jadwal selesai"
                >

                    ✓ Selesai

                </span>

              `

            : `

                <span
                    class="status-jadwal mendatang"
                >

                    ● Mendatang

                </span>

              `;


    // ======================================
    // WHATSAPP
    // ======================================

    let tombolWhatsApp =
        "";


    if (whatsapp) {

        let nomor =
            String(
                whatsapp
            ).replace(
                /\D/g,
                ""
            );


        if (
            nomor.startsWith("0")
        ) {

            nomor =
                "62" +
                nomor.substring(1);

        }


        const pesan =
            encodeURIComponent(

                `Assalamu'alaikum, saya ingin mengetahui informasi kegiatan ${acara}.`

            );


        tombolWhatsApp = `

            <a
                href="https://wa.me/${nomor}?text=${pesan}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-wa"
            >

                💬 WhatsApp

            </a>

        `;

    }


    // ======================================
    // GOOGLE MAPS
    // ======================================

    let tombolMaps =
        "";


    if (maps) {

        tombolMaps = `

            <a
                href="${escapeAttribute(
                    maps
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-maps"
            >

                📍 Buka Maps

            </a>

        `;

    }


    // ======================================
    // HTML CARD
    // ======================================

    card.innerHTML = `

        <div class="jadwal-card-header">


            <div class="tanggal">

                <div class="tanggal-icon">

                    📅

                </div>


                <div class="tanggal-text">

                    <strong>

                        ${escapeHTML(
                            namaHari
                        )}

                    </strong>


                    <span>

                        ${escapeHTML(
                            tanggalLengkap
                        )}

                    </span>

                </div>

            </div>


            ${statusHTML}

        </div>



        <div class="jadwal-card-body">


            <h3 class="acara">

                ${escapeHTML(
                    acara
                )}

            </h3>


            <div class="info-row">

                <span class="info-icon">

                    🕐

                </span>


                <span>

                    <strong>
                        Waktu
                    </strong>

                    <br>

                    ${escapeHTML(
                        waktu
                    )}

                    WITA

                </span>

            </div>



            <div class="info-row">

                <span class="info-icon">

                    📍

                </span>


                <span>

                    <strong>
                        Lokasi
                    </strong>

                    <br>

                    ${escapeHTML(
                        lokasi
                    )}

                </span>

            </div>



            <div class="info-row">

                <span class="info-icon">

                    👤

                </span>


                <span>

                    <strong>
                        Pengundang
                    </strong>

                    <br>

                    ${escapeHTML(
                        pengundang
                    )}

                </span>

            </div>



            <div class="jadwal-actions">

                ${tombolMaps}

                ${tombolWhatsApp}

            </div>


        </div>

    `;


    return card;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// ESCAPE ATTRIBUTE
// ==========================================

function escapeAttribute(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        );

}


// ==========================================
// JALANKAN
// ==========================================

loadJadwal();
