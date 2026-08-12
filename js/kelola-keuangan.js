// =========================================
// FIREBASE IMPORT
// =========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =========================================
// FIREBASE CONFIG
// =========================================
//
// PENTING:
// Gunakan CONFIG FIREBASE yang sama
// dengan halaman kelola-jadwal.js
//
// Jika kamu sudah mempunyai
// firebase-config.js yang bekerja,
// bagian ini bisa diganti menggunakan
// config tersebut.
//

const firebaseConfig = {
    apiKey: "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",
    authDomain: "safinatussurur.firebaseapp.com",
    projectId: "safinatussurur",
    storageBucket: "safinatussurur.firebasestorage.app",
    messagingSenderId: "1065917297456",
    appId: "1:1065917297456:web:27197bcdee49c226920ef5"
};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =========================================
// VARIABEL
// =========================================

let semuaTransaksi = [];

let modeEdit = false;


// =========================================
// AMBIL ELEMENT HTML
// =========================================

const tableBody =
    document.getElementById(
        "keuangan-table-body"
    );

const searchInput =
    document.getElementById(
        "search-keuangan"
    );

const modal =
    document.getElementById(
        "keuangan-modal"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const form =
    document.getElementById(
        "keuangan-form"
    );

const transaksiId =
    document.getElementById(
        "keuangan-id"
    );

const tanggalInput =
    document.getElementById(
        "tanggal"
    );

const jenisInput =
    document.getElementById(
        "jenis"
    );

const keteranganInput =
    document.getElementById(
        "keterangan"
    );

const jumlahInput =
    document.getElementById(
        "jumlah"
    );

const sumberInput =
    document.getElementById(
        "sumber"
    );

const catatanInput =
    document.getElementById(
        "catatan"
    );

const formMessage =
    document.getElementById(
        "form-message"
    );

const userEmail =
    document.getElementById(
        "user-email"
    );


// =========================================
// LOGIN PROTECTION
// =========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        // Jika belum login,
        // kembali ke halaman login

        window.location.href = "login.html";

        return;
    }


    // Tampilkan email pengurus

    if (userEmail) {

        userEmail.textContent =
            user.email || "Pengurus";

    }


    // Setelah login,
    // ambil data keuangan

    loadKeuangan();

});


// =========================================
// LOAD DATA KEUANGAN
// =========================================

async function loadKeuangan() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Memuat data keuangan...
                </td>
            </tr>
        `;


        const querySnapshot =
            await getDocs(
                collection(
                    db,
                    "keuangan"
                )
            );


        semuaTransaksi = [];


        querySnapshot.forEach((document) => {

            const data =
                document.data();


            /*
             * Dokumen yang masih kosong
             * dari pembuatan awal Firebase
             * kita abaikan.
             */

            const kosong =
                !data.Tanggal &&
                !data.Jenis &&
                !data.Keterangan &&
                !data.Jumlah &&
                !data.Sumber &&
                !data.Catatan;


            if (kosong) {

                return;

            }


            semuaTransaksi.push({

                id: document.id,

                ...data

            });

        });


        // Urutkan dari tanggal terbaru

        semuaTransaksi.sort((a, b) => {

            return String(b.Tanggal || "")
                .localeCompare(
                    String(a.Tanggal || "")
                );

        });


        updateSummary();

        tampilkanData(
            semuaTransaksi
        );


    } catch (error) {

        console.error(
            "Gagal mengambil data keuangan:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Gagal memuat data keuangan.
                </td>
            </tr>
        `;

    }

}


// =========================================
// TAMPILKAN DATA
// =========================================

function tampilkanData(data) {

    tableBody.innerHTML = "";


    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-data"
                >

                    <div class="empty-data-icon">
                        💰
                    </div>

                    <div class="empty-data-text">
                        Belum ada transaksi keuangan.
                    </div>

                </td>
            </tr>
        `;

        return;
    }


    data.forEach((transaksi, index) => {

        const row =
            document.createElement("tr");


        const jenis =
            transaksi.Jenis || "";


        const jumlah =
            Number(
                transaksi.Jumlah || 0
            );


        const jenisClass =
            jenis === "Pemasukan"
                ? "badge-pemasukan"
                : "badge-pengeluaran";


        const amountClass =
            jenis === "Pemasukan"
                ? "pemasukan"
                : "pengeluaran";


        const tanda =
            jenis === "Pemasukan"
                ? "+"
                : "-";


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>


            <td>
                ${formatTanggal(
                    transaksi.Tanggal
                )}
            </td>


            <td>

                <span
                    class="badge ${jenisClass}"
                >

                    ${jenis}

                </span>

            </td>


            <td>
                ${escapeHTML(
                    transaksi.Keterangan || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    transaksi.Sumber || "-"
                )}
            </td>


            <td>

                <span
                    class="amount ${amountClass}"
                >

                    ${tanda}
                    ${formatRupiah(jumlah)}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="btn-edit"
                        data-id="${transaksi.id}"
                        title="Edit"
                    >
                        ✏️
                    </button>


                    <button
                        class="btn-delete"
                        data-id="${transaksi.id}"
                        title="Hapus"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });


    // Tombol edit

    document
        .querySelectorAll(".btn-edit")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    editTransaksi(
                        button.dataset.id
                    );

                }
            );

        });


    // Tombol delete

    document
        .querySelectorAll(".btn-delete")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    hapusTransaksi(
                        button.dataset.id
                    );

                }
            );

        });

}


// =========================================
// UPDATE SUMMARY
// =========================================

function updateSummary() {

    let totalPemasukan = 0;

    let totalPengeluaran = 0;


    semuaTransaksi.forEach(
        (transaksi) => {

            const jumlah =
                Number(
                    transaksi.Jumlah || 0
                );


            if (
                transaksi.Jenis ===
                "Pemasukan"
            ) {

                totalPemasukan += jumlah;

            }


            if (
                transaksi.Jenis ===
                "Pengeluaran"
            ) {

                totalPengeluaran += jumlah;

            }

        }
    );


    const saldo =
        totalPemasukan -
        totalPengeluaran;


    document.getElementById(
        "total-pemasukan"
    ).textContent =
        formatRupiah(
            totalPemasukan
        );


    document.getElementById(
        "total-pengeluaran"
    ).textContent =
        formatRupiah(
            totalPengeluaran
        );


    document.getElementById(
        "saldo-kas"
    ).textContent =
        formatRupiah(
            saldo
        );

}


// =========================================
// FORMAT RUPIAH
// =========================================

function formatRupiah(angka) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(
        Number(angka) || 0
    );

}


// =========================================
// FORMAT TANGGAL
// =========================================

function formatTanggal(tanggal) {

    if (!tanggal) {

        return "-";

    }


    /*
     * Firebase menyimpan tanggal
     * dari input type=date
     * dalam format:
     *
     * YYYY-MM-DD
     *
     * Contoh:
     * 2026-08-09
     */


    const parts =
        String(tanggal).split("-");


    if (parts.length === 3) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    return tanggal;

}


// =========================================
// SEARCH
// =========================================

searchInput.addEventListener(
    "input",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        if (!keyword) {

            tampilkanData(
                semuaTransaksi
            );

            return;

        }


        const hasil =
            semuaTransaksi.filter(
                (transaksi) => {

                    const keterangan =
                        String(
                            transaksi.Keterangan || ""
                        ).toLowerCase();


                    const sumber =
                        String(
                            transaksi.Sumber || ""
                        ).toLowerCase();


                    const jenis =
                        String(
                            transaksi.Jenis || ""
                        ).toLowerCase();


                    const catatan =
                        String(
                            transaksi.Catatan || ""
                        ).toLowerCase();


                    const tanggal =
                        String(
                            transaksi.Tanggal || ""
                        ).toLowerCase();


                    return (

                        keterangan.includes(
                            keyword
                        ) ||

                        sumber.includes(
                            keyword
                        ) ||

                        jenis.includes(
                            keyword
                        ) ||

                        catatan.includes(
                            keyword
                        ) ||

                        tanggal.includes(
                            keyword
                        )

                    );

                }
            );


        tampilkanData(hasil);

    }
);


// =========================================
// BUKA MODAL TAMBAH
// =========================================

document
    .getElementById(
        "tambah-transaksi-button"
    )
    .addEventListener(
        "click",
        () => {

            bukaModalTambah();

        }
    );


// =========================================
// FUNGSI BUKA MODAL TAMBAH
// =========================================

function bukaModalTambah() {

    modeEdit = false;


    modalTitle.textContent =
        "Tambah Transaksi";


    form.reset();


    transaksiId.value = "";


    formMessage.textContent = "";

    formMessage.className = "";


    // Isi tanggal hari ini

    const today =
        new Date();


    const tahun =
        today.getFullYear();


    const bulan =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const hari =
        String(
            today.getDate()
        ).padStart(2, "0");


    tanggalInput.value =
        `${tahun}-${bulan}-${hari}`;


    modal.classList.add(
        "show"
    );

}


// =========================================
// TUTUP MODAL
// =========================================

document
    .getElementById(
        "close-modal"
    )
    .addEventListener(
        "click",
        tutupModal
    );


document
    .getElementById(
        "cancel-button"
    )
    .addEventListener(
        "click",
        tutupModal
    );


// Tutup jika klik area luar modal

modal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modal
        ) {

            tutupModal();

        }

    }
);


function tutupModal() {

    modal.classList.remove(
        "show"
    );

    form.reset();

    transaksiId.value = "";

    formMessage.textContent = "";

    formMessage.className = "";

}


// =========================================
// SIMPAN DATA
// =========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const tanggal =
            tanggalInput.value;


        const jenis =
            jenisInput.value;


        const keterangan =
            keteranganInput.value.trim();


        const jumlah =
            Number(
                jumlahInput.value
            );


        const sumber =
            sumberInput.value.trim();


        const catatan =
            catatanInput.value.trim();


        // Validasi

        if (
            !tanggal ||
            !jenis ||
            !keterangan ||
            jumlah < 0 ||
            !sumber
        ) {

            tampilkanPesan(
                "Mohon lengkapi data transaksi.",
                "error"
            );

            return;

        }


        const saveButton =
            document.getElementById(
                "save-button"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "Menyimpan...";


        try {

            const data = {

                Tanggal: tanggal,

                Jenis: jenis,

                Keterangan:
                    keterangan,

                Jumlah: jumlah,

                Sumber: sumber,

                Catatan: catatan

            };


            // =============================
            // EDIT
            // =============================

            if (modeEdit) {

                await updateDoc(

                    doc(
                        db,
                        "keuangan",
                        transaksiId.value
                    ),

                    data

                );

                tampilkanPesan(
                    "Transaksi berhasil diperbarui.",
                    "success"
                );

            }


            // =============================
            // TAMBAH
            // =============================

            else {

                await addDoc(

                    collection(
                        db,
                        "keuangan"
                    ),

                    data

                );

                tampilkanPesan(
                    "Transaksi berhasil ditambahkan.",
                    "success"
                );

            }


            // Tunggu sebentar
            // agar pesan terlihat

            setTimeout(
                async () => {

                    tutupModal();

                    await loadKeuangan();

                },
                700
            );


        } catch (error) {

            console.error(
                "Gagal menyimpan:",
                error
            );


            tampilkanPesan(
                "Gagal menyimpan transaksi.",
                "error"
            );


            saveButton.disabled = false;

            saveButton.textContent =
                "Simpan";

        }

    }
);


// =========================================
// EDIT TRANSAKSI
// =========================================

function editTransaksi(id) {

    const transaksi =
        semuaTransaksi.find(
            (item) =>
                item.id === id
        );


    if (!transaksi) {

        return;

    }


    modeEdit = true;


    modalTitle.textContent =
        "Edit Transaksi";


    transaksiId.value =
        transaksi.id;


    tanggalInput.value =
        transaksi.Tanggal || "";


    jenisInput.value =
        transaksi.Jenis || "";


    keteranganInput.value =
        transaksi.Keterangan || "";


    jumlahInput.value =
        transaksi.Jumlah || 0;


    sumberInput.value =
        transaksi.Sumber || "";


    catatanInput.value =
        transaksi.Catatan || "";


    formMessage.textContent = "";

    formMessage.className = "";


    modal.classList.add(
        "show"
    );

}


// =========================================
// HAPUS TRANSAKSI
// =========================================

async function hapusTransaksi(id) {

    const transaksi =
        semuaTransaksi.find(
            (item) =>
                item.id === id
        );


    if (!transaksi) {

        return;

    }


    const konfirmasi =
        confirm(

            `Apakah kamu yakin ingin menghapus transaksi "${transaksi.Keterangan}"?`

        );


    if (!konfirmasi) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "keuangan",
                id
            )

        );


        alert(
            "Transaksi berhasil dihapus."
        );


        await loadKeuangan();


    } catch (error) {

        console.error(
            "Gagal menghapus transaksi:",
            error
        );


        alert(
            "Gagal menghapus transaksi."
        );

    }

}


// =========================================
// PESAN FORM
// =========================================

function tampilkanPesan(
    pesan,
    tipe
) {

    formMessage.textContent =
        pesan;


    formMessage.className =
        tipe;

}


// =========================================
// ESCAPE HTML
// =========================================
// Mencegah teks yang dimasukkan
// pengguna dianggap sebagai HTML.

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


// =========================================
// LOGOUT
// =========================================

document
    .getElementById(
        "logout-button"
    )
    .addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout gagal:",
                    error
                );

                alert(
                    "Gagal logout."
                );

            }

        }
    );