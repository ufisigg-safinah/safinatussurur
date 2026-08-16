// ==========================================
// REKAP ABSENSI
// SISTEM INFORMASI HABSYI SAFINATUSSURUR
// ==========================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// ELEMENT
// ==========================================

const backButton =
    document.getElementById("back-button");

const periodeSelect =
    document.getElementById("periode-select");

const tambahPeriodeButton =
    document.getElementById("tambah-periode-button");

const totalAnggotaElement =
    document.getElementById("total-anggota");

const totalHadirElement =
    document.getElementById("total-hadir");

const totalTidakHadirElement =
    document.getElementById("total-tidak-hadir");

const totalJadwalElement =
    document.getElementById("total-jadwal");

const tableBody =
    document.getElementById("rekap-table-body");


// ==========================================
// MODAL
// ==========================================

const periodeModal =
    document.getElementById("periode-modal");

const closeModalButton =
    document.getElementById("close-modal");

const cancelButton =
    document.getElementById("cancel-button");

const periodeForm =
    document.getElementById("periode-form");

const namaPeriodeInput =
    document.getElementById("nama-periode");

const tanggalMulaiInput =
    document.getElementById("tanggal-mulai");

const tanggalSelesaiInput =
    document.getElementById("tanggal-selesai");

const periodeMessage =
    document.getElementById("periode-message");


// ==========================================
// DATA GLOBAL
// ==========================================

let semuaPeriode = [];

let semuaAnggota = [];

let semuaJadwal = [];

let semuaAbsensi = [];

let periodeAktif = null;


// ==========================================
// LOAD DATA AWAL
// ==========================================

async function loadData() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading-cell">
                    Memuat data...
                </td>
            </tr>
        `;


        await loadPeriode();

        await loadAnggota();

        await loadJadwal();

        await loadAbsensi();


        // ==================================
        // PILIH PERIODE
        // ==================================

        if (semuaPeriode.length > 0) {

            periodeAktif = semuaPeriode[0];

            periodeSelect.value =
                periodeAktif.id;

            renderRekap();

        } else {

            tampilkanTidakAdaPeriode();

        }

    }

    catch (error) {

        console.error(
            "Gagal memuat data rekap:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="error-cell"
                >
                    Gagal memuat data.
                    Silakan refresh halaman.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// LOAD PERIODE
// ==========================================

async function loadPeriode() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "periode_absensi"
            )
        );


    semuaPeriode = [];


    snapshot.forEach(
        (documentSnapshot) => {

            const data =
                documentSnapshot.data();


            semuaPeriode.push({

                id:
                    documentSnapshot.id,

                ...data

            });

        }
    );


    // ==================================
    // URUTKAN TERBARU
    // ==================================

    semuaPeriode.sort(
        (a, b) => {

            const tanggalA =
                new Date(
                    a.tanggalMulai ||
                    "1900-01-01"
                );

            const tanggalB =
                new Date(
                    b.tanggalMulai ||
                    "1900-01-01"
                );

            return tanggalB - tanggalA;

        }
    );


    // ==================================
    // SELECT PERIODE
    // ==================================

    periodeSelect.innerHTML = "";


    if (
        semuaPeriode.length === 0
    ) {

        periodeSelect.innerHTML = `
            <option value="">
                Belum ada periode
            </option>
        `;

        return;

    }


    semuaPeriode.forEach(
        (periode) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                periode.id;


            option.textContent =
                periode.nama ||
                "Periode Tanpa Nama";


            periodeSelect.appendChild(
                option
            );

        }
    );

}


// ==========================================
// LOAD ANGGOTA
// ==========================================

async function loadAnggota() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "anggota"
            )
        );


    semuaAnggota = [];


    snapshot.forEach(
        (documentSnapshot) => {

            const data =
                documentSnapshot.data();


            const status =
                String(
                    data.Status ||
                    data.status ||
                    "aktif"
                ).toLowerCase();


            // ==================================
            // ANGGOTA AKTIF
            // ==================================

            if (
                status === "aktif" ||
                status === "active"
            ) {

                semuaAnggota.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }

        }
    );


    // ==================================
    // URUTKAN NAMA
    // ==================================

    semuaAnggota.sort(
        (a, b) => {

            return (
                a.Nama ||
                a.nama ||
                ""
            ).localeCompare(
                b.Nama ||
                b.nama ||
                "",
                "id"
            );

        }
    );


    console.log(
        "Anggota aktif:",
        semuaAnggota
    );

}


// ==========================================
// LOAD JADWAL
// ==========================================

async function loadJadwal() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "jadwal"
            )
        );


    semuaJadwal = [];


    snapshot.forEach(
        (documentSnapshot) => {

            const data =
                documentSnapshot.data();


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

                id:
                    documentSnapshot.id,

                ...data,

                tanggalDate:
                    tanggal

            });

        }
    );


    console.log(
        "Semua jadwal:",
        semuaJadwal
    );

}


// ==========================================
// LOAD ABSENSI
// ==========================================

async function loadAbsensi() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "absensi"
            )
        );


    semuaAbsensi = [];


    snapshot.forEach(
        (documentSnapshot) => {

            const data =
                documentSnapshot.data();


            semuaAbsensi.push({

                id:
                    documentSnapshot.id,

                ...data

            });

        }
    );


    console.log(
        "================================="
    );

    console.log(
        "DATA ABSENSI FIREBASE:"
    );

    console.log(
        semuaAbsensi
    );

    console.log(
        "================================="
    );

}


// ==========================================
// PARSE TANGGAL
// ==========================================

function parseTanggal(
    tanggal
) {

    if (!tanggal) {
        return null;
    }


    const bagian =
        String(tanggal).split("-");


    if (
        bagian.length !== 3
    ) {

        return null;

    }


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


    hasil.setHours(
        0,
        0,
        0,
        0
    );


    return hasil;

}


// ==========================================
// RENDER REKAP
// ==========================================

function renderRekap() {

    const periodeId =
        periodeSelect.value;


    periodeAktif =
        semuaPeriode.find(
            (periode) =>
                periode.id === periodeId
        );


    if (!periodeAktif) {

        resetRekap();

        return;

    }


    console.log(
        "================================="
    );

    console.log(
        "PERIODE AKTIF:"
    );

    console.log(
        periodeAktif
    );


    // ==========================================
    // CARI JADWAL BERDASARKAN PERIODE
    // ==========================================

    let jadwalPeriode =
        semuaJadwal.filter(
            (jadwal) => {

                // PRIORITAS 1
                // Gunakan periodeId
                if (
                    jadwal.periodeId
                ) {

                    return (
                        jadwal.periodeId ===
                        periodeId
                    );

                }


                // PRIORITAS 2
                // Fallback berdasarkan tanggal

                const tanggalMulai =
                    parseTanggal(
                        periodeAktif.tanggalMulai
                    );

                const tanggalSelesai =
                    parseTanggal(
                        periodeAktif.tanggalSelesai
                    );


                if (
                    !tanggalMulai ||
                    !tanggalSelesai
                ) {

                    return false;

                }


                return (
                    jadwal.tanggalDate >=
                    tanggalMulai
                ) &&
                (
                    jadwal.tanggalDate <=
                    tanggalSelesai
                );

            }
        );


    console.log(
        "Jadwal dalam periode:",
        jadwalPeriode
    );


    // ==========================================
    // ID JADWAL
    // ==========================================

    const jadwalIds =
        jadwalPeriode.map(
            (jadwal) =>
                jadwal.id
        );


    // ==========================================
    // ABSENSI PERIODE
    // ==========================================

    const absensiPeriode =
        semuaAbsensi.filter(
            (absensi) => {

                return jadwalIds.includes(
                    absensi.jadwalId ||
                    absensi.id
                );

            }
        );


    console.log(
        "Absensi dalam periode:",
        absensiPeriode
    );


    // ==========================================
    // HITUNG RINGKASAN
    // ==========================================

    let totalHadir = 0;

    let totalTidakHadir = 0;


    absensiPeriode.forEach(
        (absensi) => {

            // ==================================
            // FORMAT BARU
            //
            // anggota: {
            //   id1: "hadir",
            //   id2: "tidak_hadir"
            // }
            // ==================================

            if (
                absensi.anggota &&
                typeof absensi.anggota ===
                "object"
            ) {

                Object.values(
                    absensi.anggota
                ).forEach(
                    (status) => {

                        if (
                            status === "hadir"
                        ) {

                            totalHadir++;

                        }


                        if (
                            status ===
                            "tidak_hadir"
                        ) {

                            totalTidakHadir++;

                        }

                    }
                );

            }

        }
    );


    // ==========================================
    // TAMPILKAN RINGKASAN
    // ==========================================

    totalAnggotaElement.textContent =
        semuaAnggota.length;


    totalHadirElement.textContent =
        totalHadir;


    totalTidakHadirElement.textContent =
        totalTidakHadir;


    totalJadwalElement.textContent =
        jadwalPeriode.length;


    // ==========================================
    // TABEL
    // ==========================================

    renderTabel(
        jadwalPeriode,
        absensiPeriode
    );

}


// ==========================================
// RENDER TABEL ANGGOTA
// ==========================================

function renderTabel(
    jadwalPeriode,
    absensiPeriode
) {

    tableBody.innerHTML = "";


    if (
        semuaAnggota.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada anggota aktif.
                </td>
            </tr>
        `;

        return;

    }


    // ==========================================
    // LOOP ANGGOTA
    // ==========================================

    semuaAnggota.forEach(
        (
            anggota,
            index
        ) => {

            let hadir = 0;

            let tidakHadir = 0;


            // ==================================
            // CEK SETIAP ABSENSI JADWAL
            // ==================================

            absensiPeriode.forEach(
                (absensi) => {

                    if (
                        !absensi.anggota
                    ) {

                        return;

                    }


                    const status =
                        absensi.anggota[
                            anggota.id
                        ];


                    if (
                        status === "hadir"
                    ) {

                        hadir++;

                    }


                    if (
                        status ===
                        "tidak_hadir"
                    ) {

                        tidakHadir++;

                    }

                }
            );


            // ==================================
            // TOTAL
            // ==================================

            const total =
                hadir +
                tidakHadir;


            // ==================================
            // PERSENTASE
            // ==================================

            let persentase = 0;


            if (
                total > 0
            ) {

                persentase =
                    Math.round(
                        (
                            hadir /
                            total
                        ) * 100
                    );

            }


            // ==================================
            // NAMA
            // ==================================

            const nama =
                anggota.Nama ||
                anggota.nama ||
                anggota.namaLengkap ||
                anggota.NamaLengkap ||
                "Anggota";


            // ==================================
            // ROW
            // ==================================

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td class="nama-anggota">

                    ${escapeHTML(
                        nama
                    )}

                </td>


                <td>

                    <span class="badge-hadir">

                        ${hadir}

                    </span>

                </td>


                <td>

                    <span class="badge-tidak-hadir">

                        ${tidakHadir}

                    </span>

                </td>


                <td>

                    ${total}

                </td>


                <td>

                    <div class="persentase">

                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="width:${persentase}%"
                            ></div>

                        </div>


                        <strong>

                            ${persentase}%

                        </strong>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// RESET REKAP
// ==========================================

function resetRekap() {

    totalAnggotaElement.textContent =
        "0";

    totalHadirElement.textContent =
        "0";

    totalTidakHadirElement.textContent =
        "0";

    totalJadwalElement.textContent =
        "0";


    tableBody.innerHTML = `

        <tr>

            <td colspan="6">

                Pilih periode absensi.

            </td>

        </tr>

    `;

}


// ==========================================
// TIDAK ADA PERIODE
// ==========================================

function tampilkanTidakAdaPeriode() {

    periodeSelect.innerHTML = `

        <option value="">

            Belum ada periode

        </option>

    `;


    resetRekap();

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
// PILIH PERIODE
// ==========================================

if (periodeSelect) {

    periodeSelect.addEventListener(
        "change",
        () => {

            renderRekap();

        }
    );

}


// ==========================================
// MODAL
// ==========================================

function bukaModal() {

    if (!periodeModal) {
        return;
    }


    periodeModal.classList.add(
        "active"
    );


    periodeMessage.textContent = "";

}


function tutupModal() {

    if (!periodeModal) {
        return;
    }


    periodeModal.classList.remove(
        "active"
    );


    periodeForm.reset();


    periodeMessage.textContent = "";

}


// ==========================================
// TOMBOL PERIODE BARU
// ==========================================

if (
    tambahPeriodeButton
) {

    tambahPeriodeButton.addEventListener(
        "click",
        bukaModal
    );

}


// ==========================================
// TUTUP MODAL
// ==========================================

if (
    closeModalButton
) {

    closeModalButton.addEventListener(
        "click",
        tutupModal
    );

}


if (
    cancelButton
) {

    cancelButton.addEventListener(
        "click",
        tutupModal
    );

}


// ==========================================
// SIMPAN PERIODE
// ==========================================

if (periodeForm) {

    periodeForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const nama =
                namaPeriodeInput.value.trim();


            const tanggalMulai =
                tanggalMulaiInput.value;


            const tanggalSelesai =
                tanggalSelesaiInput.value;


            // =================================
            // VALIDASI
            // =================================

            if (
                !nama ||
                !tanggalMulai ||
                !tanggalSelesai
            ) {

                tampilkanPesanModal(
                    "Semua data harus diisi.",
                    "error"
                );

                return;

            }


            if (
                tanggalSelesai <
                tanggalMulai
            ) {

                tampilkanPesanModal(
                    "Tanggal selesai tidak boleh sebelum tanggal mulai.",
                    "error"
                );

                return;

            }


            const submitButton =
                periodeForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;


            submitButton.textContent =
                "Menyimpan...";


            try {

                await addDoc(
                    collection(
                        db,
                        "periode_absensi"
                    ),
                    {

                        nama:
                            nama,

                        tanggalMulai:
                            tanggalMulai,

                        tanggalSelesai:
                            tanggalSelesai,

                        createdAt:
                            serverTimestamp()

                    }
                );


                tampilkanPesanModal(
                    "Periode berhasil dibuat.",
                    "success"
                );


                // =================================
                // LOAD ULANG
                // =================================

                await loadPeriode();

                await loadJadwal();

                await loadAbsensi();


                // =================================
                // CARI PERIODE BARU
                // =================================

                const periodeBaru =
                    semuaPeriode.find(
                        (periode) =>

                            periode.nama ===
                            nama &&

                            periode.tanggalMulai ===
                            tanggalMulai
                    );


                if (periodeBaru) {

                    periodeSelect.value =
                        periodeBaru.id;

                }


                renderRekap();


                setTimeout(
                    () => {

                        tutupModal();

                    },
                    700
                );

            }

            catch (error) {

                console.error(
                    "Gagal membuat periode:",
                    error
                );


                tampilkanPesanModal(
                    "Gagal membuat periode.",
                    "error"
                );

            }


            submitButton.disabled =
                false;


            submitButton.textContent =
                "Buat Periode";

        }
    );

}


// ==========================================
// PESAN MODAL
// ==========================================

function tampilkanPesanModal(
    pesan,
    tipe
) {

    if (!periodeMessage) {
        return;
    }


    periodeMessage.textContent =
        pesan;


    periodeMessage.className =
        "periode-message";


    periodeMessage.classList.add(
        tipe
    );

}


// ==========================================
// KEMBALI
// ==========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";

        }
    );

}


// ==========================================
// JALANKAN
// ==========================================

loadData();