// ==========================================
// JADWAL.JS
// Sistem Informasi Habsyi Safinatussurur
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


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


// ==========================================
// FILTER BUTTON
// ==========================================

const filterButtons =
    document.querySelectorAll(".filter-btn");


// ==========================================
// DATA GLOBAL
// ==========================================

// Menyimpan SELURUH jadwal dari Firebase
let semuaJadwal = [];

// Filter yang sedang aktif
let filterAktif = "semua";


// ==========================================
// TANGGAL HARI INI
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
// PARSE TANGGAL FIREBASE
// ==========================================

function parseTanggal(tanggalString) {

    if (!tanggalString) {
        return null;
    }


    /*
     * Firebase:
     *
     * 2026-08-11
     *
     * Kita pecah manual supaya
     * tidak terkena masalah timezone.
     */

    const bagian =
        String(tanggalString).split("-");


    if (bagian.length !== 3) {
        return null;
    }


    const tahun =
        Number(bagian[0]);

    const bulan =
        Number(bagian[1]) - 1;

    const tanggal =
        Number(bagian[2]);


    const hasil =
        new Date(
            tahun,
            bulan,
            tanggal
        );


    if (isNaN(hasil.getTime())) {
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
// LOAD JADWAL
// ==========================================

async function loadJadwal() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "jadwal"
                )
            );


        // ==================================
        // HARI INI
        // ==================================

        const hariIni =
            getHariIni();


        // ==================================
        // AMBIL SEMUA DATA
        // ==================================

        semuaJadwal = [];


        snapshot.forEach((doc) => {

            const data =
                doc.data();


            if (!data.Tanggal) {
                return;
            }


            const tanggal =
                parseTanggal(
                    data.Tanggal
                );


            if (!tanggal) {
                return;
            }


            semuaJadwal.push({

                id: doc.id,

                ...data,

                tanggalDate:
                    tanggal

            });

        });


        // ==================================
        // URUTKAN SEMUA DATA
        // ==================================

        semuaJadwal.sort(
            (a, b) =>
                a.tanggalDate -
                b.tanggalDate
        );


        // ==================================
        // HILANGKAN LOADING
        // ==================================

        jadwalLoading.style.display =
            "none";


        // ==================================
        // TAMPILKAN FILTER AWAL
        // ==================================

        renderJadwal(
            "mendatang"
        );


        // ==================================
        // AKTIFKAN FILTER
        // ==================================

        filterButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const filter =
                            button.dataset.filter;


                        // ----------------------
                        // BUTTON ACTIVE
                        // ----------------------

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


                        // ----------------------
                        // SIMPAN FILTER
                        // ----------------------

                        filterAktif =
                            filter;


                        // ----------------------
                        // RENDER
                        // ----------------------

                        renderJadwal(
                            filter
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );


        jadwalLoading.innerHTML = `

            <p>
                ❌ Gagal memuat jadwal.
            </p>

            <small>
                Silakan refresh halaman.
            </small>

        `;

    }

}


// ==========================================
// RENDER JADWAL
// ==========================================

function renderJadwal(filter) {

    // ======================================
    // BERSIHKAN CONTAINER
    // ======================================

    jadwalContainer.innerHTML = "";


    // ======================================
    // HARI INI
    // ======================================

    const hariIni =
        getHariIni();


    // ======================================
    // FILTER DATA
    // ======================================

    let dataTampil = [];


    if (filter === "semua") {

        // Semua jadwal
        dataTampil =
            [...semuaJadwal];

    }


    else if (
        filter === "mendatang"
    ) {

        // Hari ini + jadwal berikutnya

        dataTampil =
            semuaJadwal.filter(
                (data) =>
                    data.tanggalDate >=
                    hariIni
            );

    }


    else if (
        filter === "selesai"
    ) {

        // Jadwal sebelum hari ini

        dataTampil =
            semuaJadwal.filter(
                (data) =>
                    data.tanggalDate <
                    hariIni
            );

    }


    // ======================================
    // URUTKAN
    // ======================================

    if (
        filter === "selesai"
    ) {

        /*
         * Yang paling baru selesai
         * ditampilkan paling atas.
         */

        dataTampil.sort(
            (a, b) =>
                b.tanggalDate -
                a.tanggalDate
        );

    } else {

        /*
         * Jadwal mendatang dan semua
         * dari tanggal terdekat.
         */

        dataTampil.sort(
            (a, b) =>
                a.tanggalDate -
                b.tanggalDate
        );

    }


    // ======================================
    // UPDATE JUMLAH
    // ======================================

    jumlahJadwal.textContent =
        `${dataTampil.length} kegiatan`;


    // ======================================
    // JIKA KOSONG
    // ======================================

    if (
        dataTampil.length === 0
    ) {

        jadwalEmpty.style.display =
            "block";


        // Ubah pesan sesuai filter

        if (
            filter === "mendatang"
        ) {

            jadwalEmpty.querySelector(
                "h3"
            ).textContent =
                "Belum Ada Jadwal Mendatang";


            jadwalEmpty.querySelector(
                "p"
            ).textContent =
                "Saat ini belum ada kegiatan yang akan datang.";

        }


        else if (
            filter === "selesai"
        ) {

            jadwalEmpty.querySelector(
                "h3"
            ).textContent =
                "Belum Ada Jadwal Selesai";


            jadwalEmpty.querySelector(
                "p"
            ).textContent =
                "Belum terdapat kegiatan yang telah selesai.";

        }


        else {

            jadwalEmpty.querySelector(
                "h3"
            ).textContent =
                "Belum Ada Jadwal";


            jadwalEmpty.querySelector(
                "p"
            ).textContent =
                "Saat ini belum ada jadwal kegiatan.";

        }


        return;

    }


    // ======================================
    // SEMBUNYIKAN EMPTY
    // ======================================

    jadwalEmpty.style.display =
        "none";


    // ======================================
    // TAMPILKAN CARD
    // ======================================

    dataTampil.forEach(
        (data) => {

            const card =
                buatCardJadwal(
                    data
                );


            // Simpan status pada card

            card.dataset.status =
                data.tanggalDate >= hariIni
                    ? "mendatang"
                    : "selesai";


            jadwalContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// BUAT CARD JADWAL
// ==========================================

function buatCardJadwal(data) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "jadwal-card";


    // ======================================
    // FORMAT TANGGAL
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


    // ======================================
    // WHATSAPP
    // ======================================

    let tombolWhatsApp = "";


    if (data.WhatsApp) {

        let nomor =
            String(
                data.WhatsApp
            ).replace(
                /\D/g,
                ""
            );


        // Jika Indonesia diawali 0

        if (
            nomor.startsWith("0")
        ) {

            nomor =
                "62" +
                nomor.substring(1);

        }


        const pesan =
            encodeURIComponent(
                `Assalamu'alaikum, saya ingin mengetahui informasi kegiatan ${data.Acara || "Safinatussurur"}.`
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

    let tombolMaps = "";


    if (data.Maps) {

        tombolMaps = `

            <a
                href="${escapeAttribute(data.Maps)}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-maps"
            >
                📍 Buka Maps
            </a>

        `;

    }


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
                <span class="status-jadwal selesai">
                    ✓ Selesai
                </span>
              `

            : `
                <span class="status-jadwal mendatang">
                    ● Mendatang
                </span>
              `;


    // ======================================
    // CARD HTML
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
                    data.Acara ||
                    "Kegiatan Habsyi"
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
                        data.Waktu ||
                        "-"
                    )}

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
                        data.Lokasi ||
                        "-"
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
                        data.Pengundang ||
                        "-"
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

function escapeHTML(value) {

    return String(value)

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

function escapeAttribute(value) {

    return String(value)

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