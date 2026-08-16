// ========================================
// KELOLA PERIODE ABSENSI
// SAFINATUSSURUR
// ========================================


// ========================================
// FIREBASE
// ========================================

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
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",

    authDomain:
        "safinatussurur.firebaseapp.com",

    projectId:
        "safinatussurur",

    storageBucket:
        "safinatussurur.firebasestorage.app",

    messagingSenderId:
        "1065917297456",

    appId:
        "1:1065917297456:web:27197bcdee49c226920ef5"

};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const auth =
    getAuth(app);


// ========================================
// COLLECTION
// ========================================

const periodeCollection =
    collection(
        db,
        "periode_absensi"
    );


// ========================================
// ELEMENT HTML
// ========================================

const periodeList =
    document.getElementById(
        "periode-list"
    );

const searchInput =
    document.getElementById(
        "search-periode"
    );

const tambahButton =
    document.getElementById(
        "tambah-periode-button"
    );

const modal =
    document.getElementById(
        "periode-modal"
    );

const closeModalButton =
    document.getElementById(
        "close-modal"
    );

const cancelButton =
    document.getElementById(
        "cancel-button"
    );

const form =
    document.getElementById(
        "periode-form"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const periodeIdInput =
    document.getElementById(
        "periode-id"
    );

const namaPeriodeInput =
    document.getElementById(
        "nama-periode"
    );

const tanggalMulaiInput =
    document.getElementById(
        "tanggal-mulai"
    );

const tanggalSelesaiInput =
    document.getElementById(
        "tanggal-selesai"
    );

const keteranganInput =
    document.getElementById(
        "keterangan"
    );

const formMessage =
    document.getElementById(
        "form-message"
    );

const saveButton =
    document.getElementById(
        "save-button"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const userEmail =
    document.getElementById(
        "user-email"
    );


// ========================================
// DATA
// ========================================

let semuaPeriode = [];


// ========================================
// CEK LOGIN
// ========================================

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


        if (userEmail) {

            userEmail.textContent =
                user.email || "-";

        }


        await ambilDataPeriode();

    }
);


// ========================================
// AMBIL DATA PERIODE
// ========================================

async function ambilDataPeriode() {

    try {

        periodeList.innerHTML = `

            <div class="empty-data">

                Memuat data periode...

            </div>

        `;


        const snapshot =
            await getDocs(
                periodeCollection
            );


        semuaPeriode = [];


        snapshot.forEach(
            (documentSnapshot) => {

                semuaPeriode.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        // Urutkan berdasarkan tanggal mulai

        semuaPeriode.sort(
            (a, b) => {

                return String(
                    a.tanggalMulai || ""
                ).localeCompare(
                    String(
                        b.tanggalMulai || ""
                    )
                );

            }
        );


        console.log(
            "Data periode:",
            semuaPeriode
        );


        tampilkanPeriode(
            semuaPeriode
        );

    }

    catch (error) {

        console.error(
            "Gagal mengambil periode:",
            error
        );


        periodeList.innerHTML = `

            <div class="empty-data">

                Gagal memuat data periode.

            </div>

        `;

    }

}


// ========================================
// TAMPILKAN DATA PERIODE
// ========================================

function tampilkanPeriode(
    data
) {

    if (!data.length) {

        periodeList.innerHTML = `

            <div class="empty-data">

                <strong>
                    Belum ada periode absensi
                </strong>

                <span>
                    Klik "Tambah" untuk membuat periode baru.
                </span>

            </div>

        `;

        return;

    }


    periodeList.innerHTML =
        data.map(
            (periode) => {

                const aktif =
                    periode.aktif === true;


                return `

                    <div
                        class="periode-card"
                        data-id="${escapeHTML(
                            periode.id
                        )}"
                    >


                        <!-- ICON -->

                        <div class="periode-icon">

                            <span>
                                📋
                            </span>

                            <small>
                                PERIODE
                            </small>

                        </div>



                        <!-- INFORMASI -->

                        <div class="periode-info">


                            <h3>
                                ${escapeHTML(
                                    periode.nama || "-"
                                )}
                            </h3>


                            <p>

                                ${formatTanggal(
                                    periode.tanggalMulai
                                )}

                                -

                                ${formatTanggal(
                                    periode.tanggalSelesai
                                )}

                            </p>


                            <p class="periode-keterangan">

                                ${escapeHTML(
                                    periode.keterangan ||
                                    "Tidak ada keterangan"
                                )}

                            </p>


                            <span
                                class="periode-status ${
                                    aktif
                                        ? ""
                                        : "selesai"
                                }"
                            >

                                ${
                                    aktif
                                        ? "Aktif"
                                        : "Selesai"
                                }

                            </span>


                        </div>



                        <!-- AKSI -->

                        <div class="periode-actions">


                            <button
                                type="button"
                                class="btn-lihat"
                                data-action="lihat"
                                data-id="${escapeHTML(
                                    periode.id
                                )}"
                            >

                                Lihat

                            </button>


                            <button
                                type="button"
                                class="btn-edit"
                                data-action="edit"
                                data-id="${escapeHTML(
                                    periode.id
                                )}"
                            >

                                Edit

                            </button>


                            ${
                                aktif

                                    ?

                                `
                                <button
                                    type="button"
                                    class="btn-hapus"
                                    data-action="nonaktifkan"
                                    data-id="${escapeHTML(
                                        periode.id
                                    )}"
                                >

                                    Nonaktifkan

                                </button>
                                `

                                    :

                                `
                                <button
                                    type="button"
                                    class="btn-hapus"
                                    data-action="aktifkan"
                                    data-id="${escapeHTML(
                                        periode.id
                                    )}"
                                >

                                    Aktifkan

                                </button>
                                `
                            }


                            <button
                                type="button"
                                class="btn-hapus"
                                data-action="hapus"
                                data-id="${escapeHTML(
                                    periode.id
                                )}"
                            >

                                Hapus

                            </button>


                        </div>


                    </div>

                `;

            }
        ).join("");


    pasangEventPeriode();

}


// ========================================
// EVENT TOMBOL PERIODE
// ========================================

function pasangEventPeriode() {

    const buttons =
        periodeList.querySelectorAll(
            "button[data-action]"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    // EDIT

                    if (
                        action === "edit"
                    ) {

                        bukaEditPeriode(id);

                    }


                    // LIHAT

                    if (
                        action === "lihat"
                    ) {

                        lihatPeriode(id);

                    }


                    // AKTIFKAN

                    if (
                        action === "aktifkan"
                    ) {

                        await ubahStatusPeriode(
                            id,
                            true
                        );

                    }


                    // NONAKTIFKAN

                    if (
                        action === "nonaktifkan"
                    ) {

                        await ubahStatusPeriode(
                            id,
                            false
                        );

                    }


                    // HAPUS

                    if (
                        action === "hapus"
                    ) {

                        await hapusPeriode(id);

                    }

                }
            );

        }
    );

}


// ========================================
// TAMBAH PERIODE
// ========================================

if (tambahButton) {

    tambahButton.addEventListener(
        "click",
        () => {

            bukaTambahPeriode();

        }
    );

}


// ========================================
// BUKA TAMBAH
// ========================================

function bukaTambahPeriode() {

    form.reset();


    periodeIdInput.value =
        "";


    modalTitle.textContent =
        "Tambah Periode";


    formMessage.textContent =
        "";


    formMessage.className =
        "";


    modal.classList.add(
        "show"
    );


    namaPeriodeInput.focus();

}


// ========================================
// BUKA EDIT
// ========================================

function bukaEditPeriode(
    id
) {

    const periode =
        semuaPeriode.find(
            (item) =>
                item.id === id
        );


    if (!periode) {

        alert(
            "Data periode tidak ditemukan."
        );

        return;

    }


    periodeIdInput.value =
        periode.id;


    namaPeriodeInput.value =
        periode.nama || "";


    tanggalMulaiInput.value =
        periode.tanggalMulai || "";


    tanggalSelesaiInput.value =
        periode.tanggalSelesai || "";


    keteranganInput.value =
        periode.keterangan || "";


    modalTitle.textContent =
        "Edit Periode";


    formMessage.textContent =
        "";


    formMessage.className =
        "";


    modal.classList.add(
        "show"
    );


    namaPeriodeInput.focus();

}

// ========================================
// LIHAT REKAP ABSENSI
// ========================================

function lihatPeriode(id) {

    const periode =
        semuaPeriode.find(
            (item) =>
                item.id === id
        );


    if (!periode) {

        alert(
            "Data periode tidak ditemukan."
        );

        return;

    }


    // ====================================
    // BUKA HALAMAN REKAP
    // DAN KIRIM ID PERIODE
    // ====================================

    window.location.href =
        "rekap-absensi.html?periodeId=" +
        encodeURIComponent(id);

}


// ========================================
// TUTUP MODAL
// ========================================

function tutupModal() {

    modal.classList.remove(
        "show"
    );


    form.reset();


    periodeIdInput.value =
        "";


    formMessage.textContent =
        "";


    formMessage.className =
        "";

}


if (closeModalButton) {

    closeModalButton.addEventListener(
        "click",
        tutupModal
    );

}


if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        tutupModal
    );

}


// ========================================
// KLIK LUAR MODAL
// ========================================

if (modal) {

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

}


// ========================================
// SIMPAN FORM
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            await simpanPeriode();

        }
    );

}


// ========================================
// SIMPAN PERIODE
// ========================================

async function simpanPeriode() {

    const id =
        periodeIdInput.value.trim();


    const nama =
        namaPeriodeInput.value.trim();


    const tanggalMulai =
        tanggalMulaiInput.value;


    const tanggalSelesai =
        tanggalSelesaiInput.value;


    const keterangan =
        keteranganInput.value.trim();


    // ====================================
    // VALIDASI
    // ====================================

    if (!nama) {

        tampilkanFormMessage(
            "Nama periode wajib diisi.",
            "error"
        );

        return;

    }


    if (!tanggalMulai) {

        tampilkanFormMessage(
            "Tanggal mulai wajib diisi.",
            "error"
        );

        return;

    }


    if (!tanggalSelesai) {

        tampilkanFormMessage(
            "Tanggal selesai wajib diisi.",
            "error"
        );

        return;

    }


    if (
        tanggalSelesai <
        tanggalMulai
    ) {

        tampilkanFormMessage(
            "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
            "error"
        );

        return;

    }


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Menyimpan...";


    try {

        // ====================================
        // DATA BARU
        // ====================================

        const dataPeriode = {

            nama:
                nama,

            tanggalMulai:
                tanggalMulai,

            tanggalSelesai:
                tanggalSelesai,

            keterangan:
                keterangan,

            updatedAt:
                serverTimestamp()

        };


        // ====================================
        // EDIT
        // ====================================

        if (id) {

            const periodeDoc =
                doc(
                    db,
                    "periode_absensi",
                    id
                );


            await updateDoc(
                periodeDoc,
                dataPeriode
            );


            tampilkanFormMessage(
                "Periode berhasil diperbarui.",
                "success"
            );

        }


        // ====================================
        // TAMBAH
        // ====================================

        else {

            await addDoc(
                periodeCollection,
                {

                    ...dataPeriode,

                    aktif:
                        semuaPeriode.length === 0,

                    createdAt:
                        serverTimestamp()

                }
            );


            tampilkanFormMessage(
                "Periode berhasil dibuat.",
                "success"
            );

        }


        // ====================================
        // REFRESH
        // ====================================

        await ambilDataPeriode();


        setTimeout(
            () => {

                tutupModal();

            },
            700
        );

    }

    catch (error) {

        console.error(
            "Gagal menyimpan periode:",
            error
        );


        tampilkanFormMessage(
            "Gagal menyimpan periode. Silakan coba lagi.",
            "error"
        );

    }

    finally {

        saveButton.disabled =
            false;


        saveButton.textContent =
            "Simpan";

    }

}


// ========================================
// AKTIFKAN / NONAKTIFKAN
// ========================================

async function ubahStatusPeriode(
    id,
    aktif
) {

    try {

        // Jika mengaktifkan,
        // nonaktifkan periode lain dahulu.

        if (aktif) {

            await nonaktifkanSemuaPeriode();

        }


        const periodeDoc =
            doc(
                db,
                "periode_absensi",
                id
            );


        await updateDoc(
            periodeDoc,
            {

                aktif:
                    aktif,

                updatedAt:
                    serverTimestamp()

            }
        );


        await ambilDataPeriode();

    }

    catch (error) {

        console.error(
            "Gagal mengubah status:",
            error
        );


        alert(
            "Gagal mengubah status periode."
        );

    }

}


// ========================================
// NONAKTIFKAN SEMUA
// ========================================

async function nonaktifkanSemuaPeriode() {

    const snapshot =
        await getDocs(
            periodeCollection
        );


    const promises = [];


    snapshot.forEach(
        (documentSnapshot) => {

            const data =
                documentSnapshot.data();


            if (
                data.aktif === true
            ) {

                promises.push(

                    updateDoc(
                        doc(
                            db,
                            "periode_absensi",
                            documentSnapshot.id
                        ),
                        {

                            aktif:
                                false,

                            updatedAt:
                                serverTimestamp()

                        }
                    )

                );

            }

        }
    );


    await Promise.all(
        promises
    );

}


// ========================================
// HAPUS PERIODE
// ========================================

async function hapusPeriode(
    id
) {

    const periode =
        semuaPeriode.find(
            (item) =>
                item.id === id
        );


    if (!periode) {

        return;

    }


    const konfirmasi =
        confirm(

            `Hapus periode "${periode.nama}"?\n\n` +
            "Data periode ini akan dihapus."

        );


    if (!konfirmasi) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "periode_absensi",
                id
            )
        );


        await ambilDataPeriode();

    }

    catch (error) {

        console.error(
            "Gagal menghapus periode:",
            error
        );


        alert(
            "Gagal menghapus periode."
        );

    }

}


// ========================================
// SEARCH
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const keyword =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!keyword) {

                tampilkanPeriode(
                    semuaPeriode
                );

                return;

            }


            const hasil =
                semuaPeriode.filter(
                    (periode) => {

                        const nama =
                            String(
                                periode.nama || ""
                            ).toLowerCase();


                        return nama.includes(
                            keyword
                        );

                    }
                );


            tampilkanPeriode(
                hasil
            );

        }
    );

}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "Logout gagal:",
                    error
                );


                alert(
                    "Logout gagal."
                );

            }

        }
    );

}


// ========================================
// FORMAT TANGGAL
// ========================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {

        return "-";

    }


    const bagian =
        tanggal.split("-");


    if (
        bagian.length !== 3
    ) {

        return tanggal;

    }


    const tahun =
        bagian[0];


    const bulan =
        Number(
            bagian[1]
        );


    const hari =
        bagian[2];


    const namaBulan = [

        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"

    ];


    return `${hari} ${
        namaBulan[bulan - 1] || ""
    } ${tahun}`;

}


// ========================================
// FORM MESSAGE
// ========================================

function tampilkanFormMessage(
    pesan,
    tipe
) {

    formMessage.textContent =
        pesan;


    formMessage.className =
        "form-message";


    if (
        tipe === "success"
    ) {

        formMessage.classList.add(
            "success"
        );

    }


    if (
        tipe === "error"
    ) {

        formMessage.classList.add(
            "error"
        );

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    return String(value)

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