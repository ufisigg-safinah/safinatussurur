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
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ========================================
// FIREBASE CONFIG
// ========================================
//
// PENTING:
// Gunakan CONFIG YANG SAMA PERSIS
// dengan login.js kamu yang sudah berhasil.
//
// Jangan menggunakan "ISI_API_KEY".
// Jangan membuat config baru.
//

const firebaseConfig = {
    apiKey: "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",
    authDomain: "safinatussurur.firebaseapp.com",
    projectId: "safinatussurur",
    storageBucket: "safinatussurur.firebasestorage.app",
    messagingSenderId: "1065917297456",
    appId: "1:1065917297456:web:27197bcdee49c226920ef5"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ========================================
// COLLECTION
// ========================================

const jadwalCollection =
    collection(db, "jadwal");


// ========================================
// ELEMENT
// ========================================

const tableBody =
    document.getElementById(
        "jadwal-table-body"
    );

const searchInput =
    document.getElementById(
        "search-jadwal"
    );

const tambahButton =
    document.getElementById(
        "tambah-jadwal-button"
    );

const modal =
    document.getElementById(
        "jadwal-modal"
    );

const closeModal =
    document.getElementById(
        "close-modal"
    );

const cancelButton =
    document.getElementById(
        "cancel-button"
    );

const form =
    document.getElementById(
        "jadwal-form"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const jadwalId =
    document.getElementById(
        "jadwal-id"
    );

const tanggalInput =
    document.getElementById(
        "tanggal"
    );

const waktuInput =
    document.getElementById(
        "waktu"
    );

const acaraInput =
    document.getElementById(
        "acara"
    );

const lokasiInput =
    document.getElementById(
        "lokasi"
    );

const pengundangInput =
    document.getElementById(
        "pengundang"
    );

const mapsInput =
    document.getElementById(
        "maps"
    );

const whatsappInput =
    document.getElementById(
        "whatsapp"
    );

const formMessage =
    document.getElementById(
        "form-message"
    );

const saveButton =
    document.getElementById(
        "save-button"
    );

const userEmail =
    document.getElementById(
        "user-email"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );


// ========================================
// DATA LOKAL
// ========================================

let semuaJadwal = [];


// ========================================
// LOGIN PROTECTION
// ========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Pengurus login:",
                user.email
            );


            if (userEmail) {

                userEmail.textContent =
                    user.email ||
                    "Pengurus";

            }


            loadJadwal();

        }

        else {

            // Belum login
            window.location.href =
                "login.html";

        }

    }
);


// ========================================
// LOAD JADWAL
// ========================================

async function loadJadwal() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Memuat data jadwal...
                </td>
            </tr>
        `;


        const snapshot =
            await getDocs(
                jadwalCollection
            );


        semuaJadwal = [];


        snapshot.forEach(
            (documentSnapshot) => {

                semuaJadwal.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        // Urutkan dari tanggal terbaru
        // yang paling dekat terlebih dahulu

        semuaJadwal.sort(
            (a, b) => {

                const tanggalA =
                    new Date(
                        `${a.Tanggal || ""}T${a.Waktu || "00:00"}`
                    );

                const tanggalB =
                    new Date(
                        `${b.Tanggal || ""}T${b.Waktu || "00:00"}`
                    );

                return (
                    tanggalA - tanggalB
                );

            }
        );


        tampilkanJadwal(
            semuaJadwal
        );


    }

    catch (error) {

        console.error(
            "Gagal mengambil jadwal:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="error">
                    Gagal memuat data jadwal.
                    <br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

    }

}


// ========================================
// TAMPILKAN JADWAL
// ========================================

function tampilkanJadwal(
    data
) {

    tableBody.innerHTML = "";


    if (
        data.length === 0
    ) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty">
                    Belum ada data jadwal.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(
        (jadwal, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            const tanggal =
                formatTanggal(
                    jadwal.Tanggal
                );


            const waktu =
                formatWaktu(
                    jadwal.Waktu
                );


            const jadwalDate =
                buatTanggal(
                    jadwal.Tanggal,
                    jadwal.Waktu
                );


            const sekarang =
                new Date();


            const tanggalClass =
                jadwalDate &&
                jadwalDate >= sekarang
                    ? "date-upcoming"
                    : "date-past";


            // ============================
            // TOMBOL MAPS
            // ============================

            let mapsButton = "";

            if (
                jadwal.Maps &&
                jadwal.Maps.trim() !== ""
            ) {

                mapsButton = `
                    <a
                        href="${escapeAttribute(jadwal.Maps)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-small btn-maps"
                    >
                        📍 Maps
                    </a>
                `;

            }


            // ============================
            // TOMBOL WHATSAPP
            // ============================

            let whatsappButton = "";

            if (
                jadwal.WhatsApp &&
                jadwal.WhatsApp.trim() !== ""
            ) {

                const nomor =
                    formatNomorWhatsApp(
                        jadwal.WhatsApp
                    );


                whatsappButton = `
                    <a
                        href="https://wa.me/${nomor}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-small btn-wa"
                    >
                        💬 WA
                    </a>
                `;

            }


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td class="${tanggalClass}">

                    ${tanggal}

                </td>


                <td>

                    ${waktu}

                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            jadwal.Acara || "-"
                        )}
                    </strong>

                </td>


                <td>

                    ${escapeHTML(
                        jadwal.Lokasi || "-"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        jadwal.Pengundang || "-"
                    )}

                </td>


                <td>

                    <div class="contact-buttons">

                        ${mapsButton}

                        ${whatsappButton}

                    </div>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="btn-edit"
                            data-id="${escapeAttribute(
                                jadwal.id
                            )}"
                        >

                            Edit

                        </button>


                        <button
                            class="btn-delete"
                            data-id="${escapeAttribute(
                                jadwal.id
                            )}"
                        >

                            Hapus

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    // ====================================
    // EVENT EDIT
    // ====================================

    document
        .querySelectorAll(
            ".btn-edit"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editJadwal(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    // ====================================
    // EVENT HAPUS
    // ====================================

    document
        .querySelectorAll(
            ".btn-delete"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        hapusJadwal(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


// ========================================
// TAMBAH JADWAL
// ========================================

tambahButton.addEventListener(
    "click",
    bukaModalTambah
);


// ========================================
// MODAL TAMBAH
// ========================================

function bukaModalTambah() {

    modalTitle.textContent =
        "Tambah Jadwal";


    jadwalId.value = "";


    form.reset();


    formMessage.textContent = "";


    saveButton.textContent =
        "Simpan";


    modal.classList.add(
        "show"
    );

}


// ========================================
// EDIT JADWAL
// ========================================

function editJadwal(id) {

    const jadwal =
        semuaJadwal.find(
            item =>
                item.id === id
        );


    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;

    }


    modalTitle.textContent =
        "Edit Jadwal";


    jadwalId.value =
        jadwal.id;


    tanggalInput.value =
        jadwal.Tanggal || "";


    waktuInput.value =
        jadwal.Waktu || "";


    acaraInput.value =
        jadwal.Acara || "";


    lokasiInput.value =
        jadwal.Lokasi || "";


    pengundangInput.value =
        jadwal.Pengundang || "";


    mapsInput.value =
        jadwal.Maps || "";


    whatsappInput.value =
        jadwal.WhatsApp || "";


    formMessage.textContent = "";


    saveButton.textContent =
        "Simpan Perubahan";


    modal.classList.add(
        "show"
    );

}


// ========================================
// SIMPAN
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const tanggal =
            tanggalInput.value;


        const waktu =
            waktuInput.value;


        const acara =
            acaraInput.value.trim();


        const lokasi =
            lokasiInput.value.trim();


        const pengundang =
            pengundangInput.value.trim();


        const maps =
            mapsInput.value.trim();


        const whatsapp =
            whatsappInput.value.trim();


        if (
            !tanggal ||
            !waktu ||
            !acara ||
            !lokasi ||
            !pengundang
        ) {

            formMessage.textContent =
                "Tanggal, waktu, acara, lokasi, dan pengundang wajib diisi.";

            formMessage.style.color =
                "#d92d20";

            return;

        }


        try {

            saveButton.disabled =
                true;


            saveButton.textContent =
                "Menyimpan...";


            const dataJadwal = {

                Tanggal:
                    tanggal,

                Waktu:
                    waktu,

                Acara:
                    acara,

                Lokasi:
                    lokasi,

                Pengundang:
                    pengundang,

                Maps:
                    maps,

                WhatsApp:
                    whatsapp

            };


            // =================================
            // TAMBAH
            // =================================

            if (
                !jadwalId.value
            ) {

                await addDoc(
                    jadwalCollection,
                    dataJadwal
                );


                formMessage.textContent =
                    "Jadwal berhasil ditambahkan.";

            }


            // =================================
            // EDIT
            // =================================

            else {

                const jadwalRef =
                    doc(
                        db,
                        "jadwal",
                        jadwalId.value
                    );


                await updateDoc(
                    jadwalRef,
                    dataJadwal
                );


                formMessage.textContent =
                    "Jadwal berhasil diperbarui.";

            }


            formMessage.style.color =
                "#16803c";


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            tutupModal();


            await loadJadwal();


        }

        catch (error) {

            console.error(
                "Gagal menyimpan jadwal:",
                error
            );


            formMessage.textContent =
                "Gagal menyimpan: " +
                error.message;


            formMessage.style.color =
                "#d92d20";

        }

        finally {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "Simpan";

        }

    }
);


// ========================================
// HAPUS
// ========================================

async function hapusJadwal(
    id
) {

    const jadwal =
        semuaJadwal.find(
            item =>
                item.id === id
        );


    if (!jadwal) {
        return;
    }


    const konfirmasi =
        confirm(
            `Apakah kamu yakin ingin menghapus jadwal "${jadwal.Acara}"?`
        );


    if (!konfirmasi) {
        return;
    }


    try {

        const jadwalRef =
            doc(
                db,
                "jadwal",
                id
            );


        await deleteDoc(
            jadwalRef
        );


        alert(
            "Jadwal berhasil dihapus."
        );


        await loadJadwal();

    }

    catch (error) {

        console.error(
            "Gagal menghapus:",
            error
        );


        alert(
            "Gagal menghapus jadwal: " +
            error.message
        );

    }

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    () => {

        const keyword =
            searchInput.value
                .toLowerCase()
                .trim();


        if (!keyword) {

            tampilkanJadwal(
                semuaJadwal
            );

            return;

        }


        const hasil =
            semuaJadwal.filter(
                (jadwal) => {

                    const acara =
                        (
                            jadwal.Acara ||
                            ""
                        ).toLowerCase();


                    const lokasi =
                        (
                            jadwal.Lokasi ||
                            ""
                        ).toLowerCase();


                    const pengundang =
                        (
                            jadwal.Pengundang ||
                            ""
                        ).toLowerCase();


                    const tanggal =
                        (
                            jadwal.Tanggal ||
                            ""
                        ).toLowerCase();


                    return (

                        acara.includes(
                            keyword
                        ) ||

                        lokasi.includes(
                            keyword
                        ) ||

                        pengundang.includes(
                            keyword
                        ) ||

                        tanggal.includes(
                            keyword
                        )

                    );

                }
            );


        tampilkanJadwal(
            hasil
        );

    }
);


// ========================================
// TUTUP MODAL
// ========================================

closeModal.addEventListener(
    "click",
    tutupModal
);


cancelButton.addEventListener(
    "click",
    tutupModal
);


function tutupModal() {

    modal.classList.remove(
        "show"
    );


    form.reset();


    jadwalId.value = "";


    formMessage.textContent = "";


    saveButton.disabled =
        false;


    saveButton.textContent =
        "Simpan";

}


// ========================================
// KLIK DI LUAR MODAL
// ========================================

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


// ========================================
// LOGOUT
// ========================================

logoutButton.addEventListener(
    "click",
    async () => {

        const konfirmasi =
            confirm(
                "Apakah kamu yakin ingin logout?"
            );


        if (!konfirmasi) {
            return;
        }


        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout gagal:",
                error
            );


            alert(
                "Logout gagal: " +
                error.message
            );

        }

    }
);


// ========================================
// FORMAT TANGGAL
// ========================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {
        return "-";
    }


    const parts =
        tanggal.split("-");


    if (
        parts.length !== 3
    ) {

        return escapeHTML(
            tanggal
        );

    }


    const tahun =
        parts[0];

    const bulan =
        parts[1];

    const hari =
        parts[2];


    return `${hari}/${bulan}/${tahun}`;

}


// ========================================
// FORMAT WAKTU
// ========================================

function formatWaktu(
    waktu
) {

    if (!waktu) {
        return "-";
    }


    return `${waktu} WITA`;

}


// ========================================
// BUAT OBJEK DATE
// ========================================

function buatTanggal(
    tanggal,
    waktu
) {

    if (!tanggal) {
        return null;
    }


    const nilai =
        `${tanggal}T${waktu || "00:00"}:00`;


    const hasil =
        new Date(nilai);


    if (
        Number.isNaN(
            hasil.getTime()
        )
    ) {

        return null;

    }


    return hasil;

}


// ========================================
// FORMAT WHATSAPP
// ========================================

function formatNomorWhatsApp(
    nomor
) {

    let hasil =
        String(nomor)
            .replace(
                /\D/g,
                ""
            );


    // 08xxxxxxxx
    // menjadi
    // 628xxxxxxxx

    if (
        hasil.startsWith("08")
    ) {

        hasil =
            "62" +
            hasil.substring(1);

    }


    // Jika diawali 8
    if (
        hasil.startsWith("8")
    ) {

        hasil =
            "62" +
            hasil;

    }


    return hasil;

}


// ========================================
// SECURITY HTML
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


// ========================================
// SECURITY ATTRIBUTE
// ========================================

function escapeAttribute(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

}