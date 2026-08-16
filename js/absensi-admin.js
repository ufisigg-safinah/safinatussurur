// =====================================================
// ABSENSI ADMIN
// SAFINATUSSURUR
// =====================================================

import {
    db,
    auth
} from "./firebase-config.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// AMBIL ID JADWAL DARI URL
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const jadwalId =
    urlParams.get("id");


console.log(
    "ID JADWAL:",
    jadwalId
);


// =====================================================
// ELEMENT
// =====================================================

const namaKegiatan =
    document.getElementById(
        "nama-kegiatan"
    );

const tanggalKegiatan =
    document.getElementById(
        "tanggal-kegiatan"
    );

const waktuKegiatan =
    document.getElementById(
        "waktu-kegiatan"
    );

const lokasiKegiatan =
    document.getElementById(
        "lokasi-kegiatan"
    );

const totalAnggota =
    document.getElementById(
        "total-anggota"
    );

const jumlahHadir =
    document.getElementById(
        "jumlah-hadir"
    );

const jumlahTidakHadir =
    document.getElementById(
        "jumlah-tidak-hadir"
    );

const anggotaList =
    document.getElementById(
        "anggota-list"
    );

const message =
    document.getElementById(
        "absensi-message"
    );

const saveButton =
    document.getElementById(
        "save-absensi-button"
    );

const backButton =
    document.getElementById(
        "back-button"
    );


// =====================================================
// DATA GLOBAL
// =====================================================

let dataJadwal = null;

let semuaAnggota = [];

let statusAbsensi = {};


// =====================================================
// CEK LOGIN
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Pengurus login:",
            user.email
        );


        if (!jadwalId) {

            tampilkanPesan(
                "ID jadwal tidak ditemukan pada URL.",
                "error"
            );

            return;

        }


        await mulaiAbsensi();

    }
);


// =====================================================
// MULAI ABSENSI
// =====================================================

async function mulaiAbsensi() {

    try {

        await ambilJadwal();

        await ambilAnggota();

        await ambilAbsensiLama();

        tampilkanAnggota();

        updateRekap();

    }

    catch (error) {

        console.error(
            "Gagal memuat absensi:",
            error
        );


        tampilkanPesan(
            "Gagal memuat data absensi.",
            "error"
        );

    }

}


// =====================================================
// AMBIL JADWAL
// =====================================================

async function ambilJadwal() {

    const jadwalRef =
        doc(
            db,
            "jadwal",
            jadwalId
        );


    const snapshot =
        await getDoc(
            jadwalRef
        );


    if (!snapshot.exists()) {

        throw new Error(
            "Jadwal tidak ditemukan."
        );

    }


    dataJadwal = {

        id:
            snapshot.id,

        ...snapshot.data()

    };


    console.log(
        "Data jadwal:",
        dataJadwal
    );


    // =========================================
    // TAMPILKAN INFORMASI JADWAL
    // =========================================

    if (namaKegiatan) {

        namaKegiatan.textContent =
            dataJadwal.Acara ||
            "Kegiatan Habsyi";

    }


    if (tanggalKegiatan) {

        tanggalKegiatan.textContent =
            formatTanggal(
                dataJadwal.Tanggal
            );

    }


    if (waktuKegiatan) {

        waktuKegiatan.textContent =
            dataJadwal.Waktu
                ? `${dataJadwal.Waktu} WITA`
                : "-";

    }


    if (lokasiKegiatan) {

        lokasiKegiatan.textContent =
            dataJadwal.Lokasi ||
            "-";

    }

}


// =====================================================
// AMBIL ANGGOTA
// =====================================================

async function ambilAnggota() {

    const anggotaCollection =
        collection(
            db,
            "anggota"
        );


    const snapshot =
        await getDocs(
            anggotaCollection
        );


    semuaAnggota = [];


    snapshot.forEach(
        (item) => {

            const data =
                item.data();


            // =====================================
            // FILTER ANGGOTA AKTIF
            // =====================================

            const status =
                String(
                    data.Status ||
                    data.status ||
                    "aktif"
                ).toLowerCase();


            if (
                status === "aktif" ||
                status === "active"
            ) {

                semuaAnggota.push({

                    id:
                        item.id,

                    ...data

                });

            }

        }
    );


    console.log(
        "Semua anggota aktif:",
        semuaAnggota
    );


    if (totalAnggota) {

        totalAnggota.textContent =
            semuaAnggota.length;

    }

}


// =====================================================
// AMBIL ABSENSI YANG SUDAH ADA
// =====================================================

async function ambilAbsensiLama() {

    const absensiRef =
        doc(
            db,
            "absensi",
            jadwalId
        );


    const snapshot =
        await getDoc(
            absensiRef
        );


    statusAbsensi = {};


    if (
        !snapshot.exists()
    ) {

        console.log(
            "Belum ada absensi tersimpan."
        );

        return;

    }


    const data =
        snapshot.data();


    console.log(
        "Absensi lama:",
        data
    );


    // =========================================
    // FORMAT:
    //
    // anggota: {
    //    idAnggota: "hadir"
    // }
    // =========================================

    if (
        data.anggota &&
        typeof data.anggota === "object"
    ) {

        statusAbsensi =
            data.anggota;

    }

}


// =====================================================
// TAMPILKAN ANGGOTA
// =====================================================

function tampilkanAnggota() {

    if (!anggotaList) {
        return;
    }


    if (
        semuaAnggota.length === 0
    ) {

        anggotaList.innerHTML = `

            <div class="empty-message">

                Tidak ada anggota aktif.

            </div>

        `;

        return;

    }


    anggotaList.innerHTML =
        semuaAnggota
            .map(
                (anggota, index) => {

                    const nama =
                        ambilNamaAnggota(
                            anggota
                        );


                    const status =
                        statusAbsensi[
                            anggota.id
                        ] || "";


                    return `

                        <div
                            class="anggota-item"
                            data-id="${escapeHTML(
                                anggota.id
                            )}"
                        >

                            <div class="anggota-info">

                                <div class="anggota-number">

                                    ${index + 1}

                                </div>

                                <div>

                                    <strong>

                                        ${escapeHTML(
                                            nama
                                        )}

                                    </strong>

                                </div>

                            </div>


                            <div class="absensi-buttons">

                                <button
                                    type="button"
                                    class="status-button hadir-button ${
                                        status === "hadir"
                                            ? "active"
                                            : ""
                                    }"
                                    data-status="hadir"
                                    data-id="${escapeHTML(
                                        anggota.id
                                    )}"
                                >

                                    ✓ Hadir

                                </button>


                                <button
                                    type="button"
                                    class="status-button tidak-hadir-button ${
                                        status === "tidak_hadir"
                                            ? "active"
                                            : ""
                                    }"
                                    data-status="tidak_hadir"
                                    data-id="${escapeHTML(
                                        anggota.id
                                    )}"
                                >

                                    × Tidak Hadir

                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    pasangEventAbsensi();

}


// =====================================================
// EVENT STATUS ABSENSI
// =====================================================

function pasangEventAbsensi() {

    const buttons =
        anggotaList.querySelectorAll(
            ".status-button"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;


                    const status =
                        button.dataset.status;


                    statusAbsensi[id] =
                        status;


                    // =================================
                    // UPDATE TAMPILAN BUTTON
                    // =================================

                    const item =
                        button.closest(
                            ".anggota-item"
                        );


                    if (!item) {
                        return;
                    }


                    const semuaButton =
                        item.querySelectorAll(
                            ".status-button"
                        );


                    semuaButton.forEach(
                        (btn) => {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    updateRekap();

                }
            );

        }
    );

}


// =====================================================
// UPDATE REKAP
// =====================================================

function updateRekap() {

    let hadir = 0;

    let tidakHadir = 0;


    semuaAnggota.forEach(
        (anggota) => {

            const status =
                statusAbsensi[
                    anggota.id
                ];


            if (
                status === "hadir"
            ) {

                hadir++;

            }


            if (
                status === "tidak_hadir"
            ) {

                tidakHadir++;

            }

        }
    );


    if (jumlahHadir) {

        jumlahHadir.textContent =
            hadir;

    }


    if (jumlahTidakHadir) {

        jumlahTidakHadir.textContent =
            tidakHadir;

    }


    if (totalAnggota) {

        totalAnggota.textContent =
            semuaAnggota.length;

    }

}


// =====================================================
// SIMPAN ABSENSI
// =====================================================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        simpanAbsensi
    );

}


// =====================================================
// FUNGSI SIMPAN
// =====================================================

async function simpanAbsensi() {

    console.log(
        "Tombol Simpan Absensi ditekan."
    );


    // =========================================
    // VALIDASI
    // =========================================

    if (!jadwalId) {

        tampilkanPesan(
            "ID jadwal tidak ditemukan.",
            "error"
        );

        return;

    }


    if (!dataJadwal) {

        tampilkanPesan(
            "Data jadwal belum tersedia.",
            "error"
        );

        return;

    }


    if (
        semuaAnggota.length === 0
    ) {

        tampilkanPesan(
            "Tidak ada anggota yang dapat diabsen.",
            "error"
        );

        return;

    }


    // =========================================
    // CEK APAKAH SEMUA SUDAH DITENTUKAN
    // =========================================

    const belumDiisi =
        semuaAnggota.filter(
            (anggota) => {

                return !statusAbsensi[
                    anggota.id
                ];

            }
        );


    if (
        belumDiisi.length > 0
    ) {

        tampilkanPesan(

            `Masih ada ${belumDiisi.length} anggota yang belum ditentukan kehadirannya.`,

            "error"

        );


        return;

    }


    // =========================================
    // MATIKAN BUTTON
    // =========================================

    saveButton.disabled =
        true;


    saveButton.textContent =
        "Menyimpan...";


    try {

        // =========================================
        // DATA ABSENSI
        // =========================================

        const dataAbsensi = {

            jadwalId:
                jadwalId,

            tanggal:
                dataJadwal.Tanggal ||
                "",

            waktu:
                dataJadwal.Waktu ||
                "",

            acara:
                dataJadwal.Acara ||
                "",

            lokasi:
                dataJadwal.Lokasi ||
                "",

            anggota:
                statusAbsensi,

            jumlahAnggota:
                semuaAnggota.length,

            jumlahHadir:
                semuaAnggota.filter(
                    (anggota) =>
                        statusAbsensi[
                            anggota.id
                        ] === "hadir"
                ).length,

            jumlahTidakHadir:
                semuaAnggota.filter(
                    (anggota) =>
                        statusAbsensi[
                            anggota.id
                        ] === "tidak_hadir"
                ).length,

            updatedAt:
                serverTimestamp()

        };


        console.log(
            "Data yang akan disimpan:",
            dataAbsensi
        );


        // =========================================
        // SIMPAN
        //
        // ID DOCUMENT = ID JADWAL
        // =========================================

        await setDoc(

            doc(
                db,
                "absensi",
                jadwalId
            ),

            dataAbsensi,

            {
                merge: true
            }

        );


        console.log(
            "Absensi berhasil disimpan."
        );


        // =========================================
        // PESAN BERHASIL
        // =========================================

        tampilkanPesan(
            "✓ Absensi berhasil disimpan.",
            "success"
        );


        saveButton.textContent =
            "✓ Absensi Tersimpan";


        // =========================================
        // KEMBALIKAN BUTTON SETELAH 2 DETIK
        // =========================================

        setTimeout(
            () => {

                saveButton.textContent =
                    "✓ Simpan Absensi";

            },
            2000
        );

    }

    catch (error) {

        console.error(
            "ERROR SIMPAN ABSENSI:",
            error
        );


        tampilkanPesan(

            "❌ Gagal menyimpan absensi: " +
            error.message,

            "error"

        );

    }

    finally {

        saveButton.disabled =
            false;

    }

}


// =====================================================
// PESAN
// =====================================================

function tampilkanPesan(
    teks,
    tipe
) {

    if (!message) {
        return;
    }


    message.textContent =
        teks;


    message.className =
        "absensi-message";


    message.classList.add(
        tipe
    );

}


// =====================================================
// TOMBOL KEMBALI
// =====================================================

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "kelola-jadwal.html";

        }
    );

}


// =====================================================
// NAMA ANGGOTA
// =====================================================

function ambilNamaAnggota(
    anggota
) {

    return (

        anggota.Nama ||

        anggota.nama ||

        anggota.namaLengkap ||

        anggota.NamaLengkap ||

        anggota.name ||

        "Anggota"

    );

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const bagian =
        String(tanggal).split("-");


    if (
        bagian.length !== 3
    ) {

        return tanggal;

    }


    const tahun =
        Number(
            bagian[0]
        );


    const bulan =
        Number(
            bagian[1]
        ) - 1;


    const hari =
        Number(
            bagian[2]
        );


    const tanggalObj =
        new Date(
            tahun,
            bulan,
            hari
        );


    return tanggalObj.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}