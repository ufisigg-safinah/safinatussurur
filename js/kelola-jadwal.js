// =====================================================
// KELOLA JADWAL
// SAFINATUSSURUR
// =====================================================

import {
    db,
    auth
} from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// COLLECTION
// =====================================================

const jadwalCollection = collection(db, "jadwal");

const periodeCollection = collection(
    db,
    "periode_absensi"
);


// =====================================================
// ELEMENT
// =====================================================

const tableBody =
    document.getElementById("jadwal-table-body");

const searchInput =
    document.getElementById("search-jadwal");

const tambahButton =
    document.getElementById("tambah-jadwal-button");

const modal =
    document.getElementById("jadwal-modal");

const closeModalButton =
    document.getElementById("close-modal");

const cancelButton =
    document.getElementById("cancel-button");

const form =
    document.getElementById("jadwal-form");

const modalTitle =
    document.getElementById("modal-title");

const jadwalIdInput =
    document.getElementById("jadwal-id");

const tanggalInput =
    document.getElementById("tanggal");

const waktuInput =
    document.getElementById("waktu");

const acaraInput =
    document.getElementById("acara");

const lokasiInput =
    document.getElementById("lokasi");

const pengundangInput =
    document.getElementById("pengundang");

const mapsInput =
    document.getElementById("maps");

const whatsappInput =
    document.getElementById("whatsapp");

const periodeIdInput =
    document.getElementById("periode-id");

const periodeInfo =
    document.getElementById("periode-info");

const formMessage =
    document.getElementById("form-message");

const saveButton =
    document.getElementById("save-button");

const logoutButton =
    document.getElementById("logout-button");

const userEmail =
    document.getElementById("user-email");


// =====================================================
// DATA GLOBAL
// =====================================================

let semuaJadwal = [];

let semuaPeriode = [];

let filterAktif = "semua";


// =====================================================
// CEK LOGIN
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href = "login.html";

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


        await ambilPeriode();

        await ambilJadwal();

    }
);


// =====================================================
// AMBIL PERIODE
// =====================================================

async function ambilPeriode() {

    try {

        const snapshot =
            await getDocs(
                periodeCollection
            );


        semuaPeriode = [];


        snapshot.forEach(
            (item) => {

                semuaPeriode.push({

                    id: item.id,

                    ...item.data()

                });

            }
        );


        console.log(
            "Semua periode:",
            semuaPeriode
        );

    }

    catch (error) {

        console.error(
            "Gagal mengambil periode:",
            error
        );

        semuaPeriode = [];

    }

}


// =====================================================
// AMBIL JADWAL
// =====================================================

async function ambilJadwal() {

    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="loading"
            >

                Memuat data jadwal...

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                jadwalCollection
            );


        semuaJadwal = [];


        snapshot.forEach(
            (item) => {

                semuaJadwal.push({

                    id: item.id,

                    ...item.data()

                });

            }
        );


        // =================================================
        // URUTKAN BERDASARKAN TANGGAL DAN WAKTU
        // =================================================

        semuaJadwal.sort(
            (a, b) => {

                return (
                    buatTanggalJadwal(
                        a.Tanggal,
                        a.Waktu
                    ) -
                    buatTanggalJadwal(
                        b.Tanggal,
                        b.Waktu
                    )
                );

            }
        );


        console.log(
            "Semua jadwal:",
            semuaJadwal
        );


        tampilkanJadwal();

    }

    catch (error) {

        console.error(
            "Gagal mengambil jadwal:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading"
                >

                    ❌ Gagal memuat data jadwal.

                    <br>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </td>

            </tr>

        `;

    }

}


// =====================================================
// BUAT DATE JADWAL
// =====================================================

function buatTanggalJadwal(
    tanggal,
    waktu
) {

    if (!tanggal) {

        return new Date(0);

    }


    const bagianTanggal =
        String(tanggal).split("-");


    const tahun =
        Number(bagianTanggal[0]);

    const bulan =
        Number(bagianTanggal[1]) - 1;

    const hari =
        Number(bagianTanggal[2]);


    let jam = 0;

    let menit = 0;


    if (waktu) {

        const bagianWaktu =
            String(waktu).split(":");


        jam =
            Number(
                bagianWaktu[0] || 0
            );


        menit =
            Number(
                bagianWaktu[1] || 0
            );

    }


    return new Date(
        tahun,
        bulan,
        hari,
        jam,
        menit,
        0,
        0
    );

}


// =====================================================
// STATUS JADWAL
// Selesai 5 jam setelah waktu kegiatan
// =====================================================

function getStatusJadwal(data) {

    const waktuJadwal =
        buatTanggalJadwal(
            data.Tanggal,
            data.Waktu
        );


    const waktuSelesai =
        new Date(
            waktuJadwal.getTime() +
            (5 * 60 * 60 * 1000)
        );


    const sekarang =
        new Date();


    if (
        sekarang >= waktuSelesai
    ) {

        return "selesai";

    }


    return "mendatang";

}


// =====================================================
// TAMPILKAN JADWAL
// =====================================================

function tampilkanJadwal() {

    if (!tableBody) {
        return;
    }


    let dataTampil =
        [...semuaJadwal];


    // =================================================
    // FILTER
    // =================================================

    if (
        filterAktif === "mendatang"
    ) {

        dataTampil =
            dataTampil.filter(
                (jadwal) =>
                    getStatusJadwal(jadwal)
                    ===
                    "mendatang"
            );

    }


    if (
        filterAktif === "selesai"
    ) {

        dataTampil =
            dataTampil.filter(
                (jadwal) =>
                    getStatusJadwal(jadwal)
                    ===
                    "selesai"
            );

    }


    // =================================================
    // SEARCH
    // =================================================

    const keyword =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (keyword) {

        dataTampil =
            dataTampil.filter(
                (jadwal) => {

                    const teks = `

                        ${jadwal.Acara || ""}

                        ${jadwal.Lokasi || ""}

                        ${jadwal.Pengundang || ""}

                        ${jadwal.Tanggal || ""}

                        ${jadwal.Waktu || ""}

                        ${jadwal.periodeNama || ""}

                    `.toLowerCase();


                    return teks.includes(
                        keyword
                    );

                }
            );

    }


    // =================================================
    // JUMLAH JADWAL
    // =================================================

    const jumlahJadwal =
        document.getElementById(
            "jumlah-jadwal"
        );


    if (jumlahJadwal) {

        jumlahJadwal.textContent =
            `${dataTampil.length} kegiatan`;

    }


    // =================================================
    // TIDAK ADA DATA
    // =================================================

    if (
        dataTampil.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading"
                >

                    ${pesanKosong()}

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // RENDER
    // =================================================

    tableBody.innerHTML =
        dataTampil
            .map(
                (jadwal, index) =>
                    buatBarisJadwal(
                        jadwal,
                        index + 1
                    )
            )
            .join("");


    pasangEventAksi();

}


// =====================================================
// PESAN KOSONG
// =====================================================

function pesanKosong() {

    if (
        filterAktif === "mendatang"
    ) {

        return "📅 Belum ada jadwal mendatang.";

    }


    if (
        filterAktif === "selesai"
    ) {

        return "✓ Belum ada jadwal yang selesai.";

    }


    return "Belum ada data jadwal.";

}


// =====================================================
// BUAT BARIS JADWAL
// =====================================================

function buatBarisJadwal(
    jadwal,
    nomor
) {

    const status =
        getStatusJadwal(jadwal);


    // =================================================
    // STATUS
    // =================================================

    const statusHTML =
        status === "selesai"

            ? `

                <span class="status selesai">

                    ✓ Selesai

                </span>

            `

            : `

                <span class="status mendatang">

                    ● Mendatang

                </span>

            `;


    // =================================================
    // PERIODE
    // =================================================

    const periodeHTML =
        jadwal.periodeNama

            ? `

                <small class="periode-jadwal">

                    📋
                    ${escapeHTML(
                        jadwal.periodeNama
                    )}

                </small>

            `

            : `

                <small class="periode-jadwal">

                    Belum ada periode

                </small>

            `;


    // =================================================
    // WHATSAPP
    // =================================================

    const whatsappHTML =
        jadwal.WhatsApp

            ? `

                <a
                    href="https://wa.me/${nomorWhatsApp(
                        jadwal.WhatsApp
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >

                    WhatsApp

                </a>

            `

            : "-";


    // =================================================
    // RETURN BARIS
    // =================================================

    return `

        <tr>


            <!-- NO -->

            <td>

                ${nomor}

            </td>


            <!-- TANGGAL -->

            <td>

                <strong>

                    ${escapeHTML(
                        formatTanggal(
                            jadwal.Tanggal
                        )
                    )}

                </strong>

            </td>


            <!-- WAKTU -->

            <td>

                ${escapeHTML(
                    jadwal.Waktu || "-"
                )}

                <small>

                    WITA

                </small>

            </td>


            <!-- ACARA -->

            <td>

                <strong>

                    ${escapeHTML(
                        jadwal.Acara ||
                        "Kegiatan Habsyi"
                    )}

                </strong>

            </td>


            <!-- LOKASI -->

            <td>

                ${escapeHTML(
                    jadwal.Lokasi || "-"
                )}

                ${
                    jadwal.Maps
                        ?
                    `
                        <br>

                        <a
                            href="${escapeHTML(
                                jadwal.Maps
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            📍 Maps

                        </a>
                    `
                        :
                    ""
                }

            </td>


            <!-- PENGUNDANG -->

            <td>

                ${escapeHTML(
                    jadwal.Pengundang || "-"
                )}

            </td>


            <!-- PERIODE ABSENSI -->

            <td>

                ${periodeHTML}

            </td>


            <!-- KONTAK -->

            <td>

                ${whatsappHTML}

            </td>


            <!-- STATUS -->

            <td>

                ${statusHTML}

            </td>


            <!-- AKSI -->

            <td>

                <div class="aksi-jadwal">


                    <!-- ABSENSI -->

                    <button
                        type="button"
                        class="btn-absensi"
                        data-action="absensi"
                        data-id="${escapeHTML(
                            jadwal.id
                        )}"
                    >

                        Absensi

                    </button>


                    <!-- EDIT -->

                    <button
                        type="button"
                        class="btn-edit"
                        data-action="edit"
                        data-id="${escapeHTML(
                            jadwal.id
                        )}"
                    >

                        Edit

                    </button>


                    <!-- HAPUS -->

                    <button
                        type="button"
                        class="btn-hapus"
                        data-action="hapus"
                        data-id="${escapeHTML(
                            jadwal.id
                        )}"
                    >

                        Hapus

                    </button>


                </div>

            </td>


        </tr>

    `;

}


// =====================================================
// EVENT AKSI
// =====================================================

function pasangEventAksi() {

    const buttons =
        tableBody.querySelectorAll(
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


                    console.log(
                        "Aksi:",
                        action,
                        "ID:",
                        id
                    );


                    // =================================
                    // ABSENSI
                    // =================================

                    if (
                        action === "absensi"
                    ) {

                        bukaHalamanAbsensi(
                            id
                        );

                        return;

                    }


                    // =================================
                    // EDIT
                    // =================================

                    if (
                        action === "edit"
                    ) {

                        bukaEditJadwal(
                            id
                        );

                        return;

                    }


                    // =================================
                    // HAPUS
                    // =================================

                    if (
                        action === "hapus"
                    ) {

                        await hapusJadwal(
                            id
                        );

                    }

                }
            );

        }
    );

}


// =====================================================
// BUKA HALAMAN ABSENSI
// =====================================================

function bukaHalamanAbsensi(
    jadwalId
) {

    if (!jadwalId) {

        alert(
            "ID jadwal tidak ditemukan."
        );

        return;

    }


    const url =
        `absensi.html?id=${encodeURIComponent(
            jadwalId
        )}`;


    console.log(
        "Membuka absensi:",
        url
    );


    window.location.href =
        url;

}


// =====================================================
// FILTER
// =====================================================

const filterButtons =
    document.querySelectorAll(
        "[data-filter]"
    );


filterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

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


                filterAktif =
                    button.dataset.filter;


                tampilkanJadwal();

            }
        );

    }
);


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            tampilkanJadwal();

        }
    );

}


// =====================================================
// TAMBAH JADWAL
// =====================================================

if (tambahButton) {

    tambahButton.addEventListener(
        "click",
        bukaTambahJadwal
    );

}


// =====================================================
// BUKA TAMBAH
// =====================================================

function bukaTambahJadwal() {

    form.reset();


    jadwalIdInput.value =
        "";


    modalTitle.textContent =
        "Tambah Jadwal";


    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";


    if (periodeInfo) {

        periodeInfo.innerHTML = `

            <div class="periode-loading">

                📋 Pilih tanggal kegiatan terlebih dahulu.

            </div>

        `;

    }


    if (periodeIdInput) {

        periodeIdInput.value =
            "";

    }


    modal.classList.add(
        "show"
    );


    tanggalInput.focus();

}


// =====================================================
// BUKA EDIT
// =====================================================

function bukaEditJadwal(
    id
) {

    const jadwal =
        semuaJadwal.find(
            (item) =>
                item.id === id
        );


    if (!jadwal) {

        alert(
            "Data jadwal tidak ditemukan."
        );

        return;

    }


    jadwalIdInput.value =
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


    modalTitle.textContent =
        "Edit Jadwal";


    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";


    tampilkanInfoPeriode(
        jadwal.Tanggal
    );


    modal.classList.add(
        "show"
    );


    tanggalInput.focus();

}


// =====================================================
// TUTUP MODAL
// =====================================================

function tutupModal() {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    form.reset();


    jadwalIdInput.value =
        "";


    if (periodeIdInput) {

        periodeIdInput.value =
            "";

    }


    if (periodeInfo) {

        periodeInfo.innerHTML = `

            <div class="periode-loading">

                📋 Pilih tanggal kegiatan terlebih dahulu.

            </div>

        `;

    }


    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";

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


// =====================================================
// PERIODE BERDASARKAN TANGGAL
// =====================================================

function cariPeriodeUntukTanggal(
    tanggal
) {

    if (!tanggal) {

        return null;

    }


    const hasil =
        semuaPeriode.find(
            (periode) => {

                if (
                    !periode.tanggalMulai ||
                    !periode.tanggalSelesai
                ) {

                    return false;

                }


                return (
                    tanggal >=
                    periode.tanggalMulai
                )
                &&
                (
                    tanggal <=
                    periode.tanggalSelesai
                );

            }
        );


    return hasil || null;

}


// =====================================================
// TAMPILKAN INFO PERIODE
// =====================================================

function tampilkanInfoPeriode(
    tanggal
) {

    if (!periodeInfo) {
        return;
    }


    if (!tanggal) {

        periodeInfo.innerHTML = `

            <div class="periode-loading">

                📋 Pilih tanggal kegiatan terlebih dahulu.

            </div>

        `;

        return;

    }


    const periode =
        cariPeriodeUntukTanggal(
            tanggal
        );


    if (!periode) {

        periodeInfo.innerHTML = `

            <div class="periode-loading">

                ⚠️ Tidak ada periode absensi
                untuk tanggal ini.

            </div>

        `;


        if (periodeIdInput) {

            periodeIdInput.value =
                "";

        }


        return;

    }


    if (periodeIdInput) {

        periodeIdInput.value =
            periode.id;

    }


    periodeInfo.innerHTML = `

        <div class="periode-success">

            📋

            <strong>

                ${escapeHTML(
                    periode.nama || "Periode Absensi"
                )}

            </strong>

            <br>

            <small>

                ${escapeHTML(
                    periode.tanggalMulai || "-"
                )}

                s/d

                ${escapeHTML(
                    periode.tanggalSelesai || "-"
                )}

            </small>

        </div>

    `;

}


// =====================================================
// SAAT TANGGAL BERUBAH
// =====================================================

if (tanggalInput) {

    tanggalInput.addEventListener(
        "change",
        () => {

            tampilkanInfoPeriode(
                tanggalInput.value
            );

        }
    );

}


// =====================================================
// SUBMIT FORM
// =====================================================

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await simpanJadwal();

        }
    );

}


// =====================================================
// SIMPAN JADWAL
// =====================================================

async function simpanJadwal() {

    const id =
        jadwalIdInput.value.trim();


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


    // =================================================
    // VALIDASI
    // =================================================

    if (!tanggal) {

        tampilkanPesan(
            "Tanggal wajib diisi.",
            "error"
        );

        return;

    }


    if (!waktu) {

        tampilkanPesan(
            "Waktu wajib diisi.",
            "error"
        );

        return;

    }


    if (!acara) {

        tampilkanPesan(
            "Nama acara wajib diisi.",
            "error"
        );

        return;

    }


    if (!lokasi) {

        tampilkanPesan(
            "Lokasi wajib diisi.",
            "error"
        );

        return;

    }


    if (!pengundang) {

        tampilkanPesan(
            "Pengundang wajib diisi.",
            "error"
        );

        return;

    }


    // =================================================
    // CARI PERIODE
    // =================================================

    const periode =
        cariPeriodeUntukTanggal(
            tanggal
        );


    // =================================================
    // DATA
    // =================================================

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
            whatsapp,

        periodeId:
            periode
                ? periode.id
                : "",

        periodeNama:
            periode
                ? periode.nama
                : "",

        updatedAt:
            serverTimestamp()

    };


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Menyimpan...";


    try {

        // =================================================
        // EDIT
        // =================================================

        if (id) {

            await updateDoc(
                doc(
                    db,
                    "jadwal",
                    id
                ),
                dataJadwal
            );


            tampilkanPesan(
                "Jadwal berhasil diperbarui.",
                "success"
            );

        }

        // =================================================
        // TAMBAH
        // =================================================

        else {

            await addDoc(
                jadwalCollection,
                {

                    ...dataJadwal,

                    createdAt:
                        serverTimestamp()

                }
            );


            tampilkanPesan(
                "Jadwal berhasil ditambahkan.",
                "success"
            );

        }


        // =================================================
        // REFRESH
        // =================================================

        await ambilJadwal();


        setTimeout(
            () => {

                tutupModal();

            },
            700
        );

    }

    catch (error) {

        console.error(
            "Gagal menyimpan:",
            error
        );


        tampilkanPesan(
            "Gagal menyimpan jadwal.",
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


// =====================================================
// HAPUS JADWAL
// =====================================================

async function hapusJadwal(
    id
) {

    const jadwal =
        semuaJadwal.find(
            (item) =>
                item.id === id
        );


    if (!jadwal) {
        return;
    }


    const konfirmasi =
        confirm(
            `Hapus jadwal "${jadwal.Acara || "Kegiatan"}"?`
        );


    if (!konfirmasi) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "jadwal",
                id
            )
        );


        await ambilJadwal();


        alert(
            "Jadwal berhasil dihapus."
        );

    }

    catch (error) {

        console.error(
            "Gagal menghapus:",
            error
        );


        alert(
            "Gagal menghapus jadwal."
        );

    }

}


// =====================================================
// PESAN
// =====================================================

function tampilkanPesan(
    pesan,
    tipe
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        pesan;


    formMessage.className =
        "form-message";


    formMessage.classList.add(
        tipe
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


    const hasil =
        new Date(
            Number(bagian[0]),
            Number(bagian[1]) - 1,
            Number(bagian[2])
        );


    return hasil.toLocaleDateString(
        "id-ID",
        {

            day: "numeric",

            month: "long",

            year: "numeric"

        }
    );

}


// =====================================================
// NOMOR WHATSAPP
// =====================================================

function nomorWhatsApp(
    nomor
) {

    let hasil =
        String(
            nomor || ""
        ).replace(
            /\D/g,
            ""
        );


    if (
        hasil.startsWith("0")
    ) {

        hasil =
            "62" +
            hasil.substring(1);

    }


    return hasil;

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


// =====================================================
// LOGOUT
// =====================================================

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


// =====================================================
// AUTO UPDATE STATUS
// =====================================================

setInterval(
    () => {

        if (
            semuaJadwal.length > 0
        ) {

            tampilkanJadwal();

        }

    },
    60 * 1000
);
