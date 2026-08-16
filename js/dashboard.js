// ================================
// DASHBOARD.JS
// Sistem Informasi Habsyi Safinatussurur
// ================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ================================
// CEK STATUS LOGIN
// ================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("User berhasil login:", user.email);

        // Tampilkan email user
        const userEmail = document.getElementById("user-email");

        if (userEmail) {
            userEmail.textContent = user.email;
        }

        // Jalankan pengambilan data dashboard
        loadDashboard();

    } else {

        // Jika belum login
        console.log("User belum login");

        window.location.href = "login.html";
    }
});


// ================================
// LOGOUT
// ================================

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            console.log("Logout berhasil");

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout gagal:", error);

            alert("Logout gagal. Silakan coba lagi.");
        }

    });

}


// ================================
// LOAD DATA DASHBOARD
// ================================

async function loadDashboard() {

    try {

        // =================================
        // DATA ANGGOTA
        // =================================

        const anggotaRef =
            collection(db, "anggota");

        const snapshot =
            await getDocs(anggotaRef);

        let jumlahAnggota = 0;
        let jumlahAktif = 0;


        snapshot.forEach((doc) => {

            const data = doc.data();

            jumlahAnggota++;


            if (data.Status === "Aktif") {

                jumlahAktif++;

            }

        });


        // Tampilkan jumlah anggota

        const totalAnggota =
            document.getElementById("total-anggota");

        if (totalAnggota) {

            totalAnggota.textContent =
                jumlahAnggota;

        }


        // Tampilkan jumlah anggota aktif

        const anggotaAktif =
            document.getElementById("anggota-aktif");

        if (anggotaAktif) {

            anggotaAktif.textContent =
                jumlahAktif;

        }


        console.log(
            "Total anggota:",
            jumlahAnggota
        );

        console.log(
            "Anggota aktif:",
            jumlahAktif
        );


        // =================================
        // DATA JADWAL
        // =================================

        await loadJadwal();

// =================================
        // keuangan
        // =================================
        await loadKeuangan();


    } catch (error) {

        console.error(
            "Gagal mengambil data dashboard:",
            error
        );

    }

}

    


// ==========================================
// LOAD JUMLAH JADWAL YANG AKAN DATANG
// ==========================================

async function loadJadwal() {

    try {

        // Ambil semua data dari collection "jadwal"
        const snapshot = await getDocs(
            collection(db, "jadwal")
        );

        let jumlahJadwal = 0;

        // Tanggal hari ini
        const hariIni = new Date();

        hariIni.setHours(0, 0, 0, 0);


        // Periksa setiap dokumen
        snapshot.forEach((doc) => {

            const data = doc.data();

            // Pastikan field Tanggal ada
            if (!data.Tanggal) {
                return;
            }


            // Karena Tanggal di Firebase kamu:
            // contoh: 2026-08-11

            let tanggalJadwal =
                new Date(
                    data.Tanggal + "T00:00:00"
                );


            // Pastikan tanggal valid
            if (
                !isNaN(
                    tanggalJadwal.getTime()
                )
            ) {

                // Hitung jika hari ini
                // atau tanggal setelah hari ini

                if (
                    tanggalJadwal >= hariIni
                ) {

                    jumlahJadwal++;

                }

            }

        });


        // ==================================
        // TAMPILKAN KE DASHBOARD
        // ==================================

        const totalJadwal =
            document.getElementById(
                "total-jadwal"
            );


        if (totalJadwal) {

            totalJadwal.textContent =
                jumlahJadwal;

        }


        console.log(
            "Jumlah jadwal akan datang:",
            jumlahJadwal
        );


    } catch (error) {

        console.error(
            "Gagal mengambil data jadwal:",
            error
        );

    }

}

// ==========================================
// LOAD SALDO KAS
// ==========================================

async function loadKeuangan() {

    try {

        // Ambil data dari collection keuangan
        const snapshot = await getDocs(
            collection(db, "keuangan")
        );

        let pemasukan = 0;
        let pengeluaran = 0;

        snapshot.forEach((doc) => {

            const data = doc.data();

            console.log("Data keuangan:", data);

            // Ambil jumlah
            let jumlah = Number(data.Jumlah);

            if (isNaN(jumlah)) {
                jumlah = 0;
            }

            // Ambil jenis transaksi
            const jenis = String(
                data.Jenis || ""
            ).toLowerCase().trim();


            // =========================
            // PEMASUKAN
            // =========================

            if (
                jenis === "pemasukan" ||
                jenis === "masuk" ||
                jenis === "income"
            ) {

                pemasukan += jumlah;

            }


            // =========================
            // PENGELUARAN
            // =========================

            else if (
                jenis === "pengeluaran" ||
                jenis === "keluar" ||
                jenis === "expense"
            ) {

                pengeluaran += jumlah;

            }

        });


        // =========================
        // HITUNG SALDO
        // =========================

        const saldo =
            pemasukan - pengeluaran;


        console.log(
            "Total pemasukan:",
            pemasukan
        );

        console.log(
            "Total pengeluaran:",
            pengeluaran
        );

        console.log(
            "Saldo kas:",
            saldo
        );


        // =========================
        // TAMPILKAN KE DASHBOARD
        // =========================

        const totalKas =
            document.getElementById("total-kas");


        if (totalKas) {

            totalKas.textContent =
                formatRupiah(saldo);

        }


    } catch (error) {

        console.error(
            "Gagal mengambil data keuangan:",
            error
        );

    }

}
// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);

}
