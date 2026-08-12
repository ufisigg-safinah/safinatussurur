// =====================================
// INDEX.JS
// SISTEM INFORMASI HABSYI SAFINATUSSURUR
// =====================================


// =====================================
// FIREBASE
// =====================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// ELEMENT STATISTIK
// =====================================

const jumlahAnggota =
    document.querySelector("#jumlah-anggota");

const jumlahJadwal =
    document.querySelector("#jumlah-jadwal");

const jumlahKegiatan =
    document.querySelector("#jumlah-kegiatan");


// =====================================
// TANGGAL HARI INI
// =====================================

function tanggalHariIni() {

    const hariIni = new Date();

    hariIni.setHours(
        0,
        0,
        0,
        0
    );

    return hariIni;
}


// =====================================
// KONVERSI TANGGAL FIREBASE
// =====================================

function ubahKeTanggal(nilai) {

    if (!nilai) {
        return null;
    }


    /*
     * Format utama Firebase:
     *
     * 2026-08-11
     *
     * Kita tambahkan waktu 00:00:00
     * agar perbandingan tanggal konsisten.
     */

    const tanggal =
        new Date(
            String(nilai) +
            "T00:00:00"
        );


    if (
        isNaN(
            tanggal.getTime()
        )
    ) {

        return null;

    }


    tanggal.setHours(
        0,
        0,
        0,
        0
    );


    return tanggal;

}


// =====================================
// AMBIL SEMUA DATA JADWAL
// =====================================

async function ambilDataJadwal() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "jadwal"
                )
            );


        return snapshot;


    } catch (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );


        return null;

    }

}


// =====================================
// HITUNG JADWAL MENDATANG
// =====================================

async function tampilkanJumlahJadwal() {

    const snapshot =
        await ambilDataJadwal();


    if (!snapshot) {

        if (jumlahJadwal) {

            jumlahJadwal.textContent =
                "0";

        }

        return;

    }


    const hariIni =
        tanggalHariIni();


    let jumlahMendatang =
        0;


    snapshot.forEach(
        (doc) => {

            const data =
                doc.data();


            /*
             * Menggunakan Tanggal.
             *
             * Jika suatu saat ada data
             * menggunakan "tanggal",
             * tetap akan terbaca.
             */

            const nilaiTanggal =
                data.Tanggal ||
                data.tanggal;


            const tanggal =
                ubahKeTanggal(
                    nilaiTanggal
                );


            if (!tanggal) {
                return;
            }


            /*
             * Hari ini dan tanggal setelahnya
             * dianggap JADWAL MENDATANG.
             */

            if (
                tanggal >= hariIni
            ) {

                jumlahMendatang++;

            }

        }
    );


    if (jumlahJadwal) {

        jumlahJadwal.textContent =
            jumlahMendatang;

    }

}


// =====================================
// HITUNG KEGIATAN TERLAKSANA
// =====================================

async function tampilkanJumlahKegiatan() {

    const snapshot =
        await ambilDataJadwal();


    if (!snapshot) {

        if (jumlahKegiatan) {

            jumlahKegiatan.textContent =
                "0";

        }

        return;

    }


    const hariIni =
        tanggalHariIni();


    let jumlahTerlaksana =
        0;


    snapshot.forEach(
        (doc) => {

            const data =
                doc.data();


            const nilaiTanggal =
                data.Tanggal ||
                data.tanggal;


            const tanggal =
                ubahKeTanggal(
                    nilaiTanggal
                );


            if (!tanggal) {
                return;
            }


            /*
             * Hanya tanggal yang sudah lewat
             * yang dianggap TERLAKSANA.
             */

            if (
                tanggal < hariIni
            ) {

                jumlahTerlaksana++;

            }

        }
    );


    if (jumlahKegiatan) {

        jumlahKegiatan.textContent =
            jumlahTerlaksana;

    }

}


// =====================================
// HITUNG JUMLAH ANGGOTA
// =====================================

async function tampilkanJumlahAnggota() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "anggota"
                )
            );


        if (jumlahAnggota) {

            jumlahAnggota.textContent =
                snapshot.size;

        }


    } catch (error) {

        console.error(
            "Gagal mengambil jumlah anggota:",
            error
        );


        if (jumlahAnggota) {

            jumlahAnggota.textContent =
                "0";

        }

    }

}


// =====================================
// JALANKAN
// =====================================

tampilkanJumlahAnggota();

tampilkanJumlahJadwal();

tampilkanJumlahKegiatan();