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
// KONFIGURASI FIREBASE
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyD0izNMCi-Ef52v_bW5WWeB4nxoaUrehG4",
    authDomain: "safinatussurur.firebaseapp.com",
    projectId: "safinatussurur",
    storageBucket: "safinatussurur.firebasestorage.app",
    messagingSenderId: "1065917297456",
    appId: "1:1065917297456:web:27197bcdee49c226920ef5"
};


// ========================================
// INISIALISASI
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ========================================
// COLLECTION
// ========================================

const anggotaCollection = collection(db, "anggota");


// ========================================
// ELEMENT HTML
// ========================================

const tableBody =
    document.getElementById("anggota-table-body");

const searchInput =
    document.getElementById("search-anggota");

const tambahButton =
    document.getElementById("tambah-anggota-button");

const modal =
    document.getElementById("anggota-modal");

const closeModal =
    document.getElementById("close-modal");

const cancelButton =
    document.getElementById("cancel-button");

const form =
    document.getElementById("anggota-form");

const modalTitle =
    document.getElementById("modal-title");

const anggotaId =
    document.getElementById("anggota-id");

const namaInput =
    document.getElementById("nama");

const jabatanInput =
    document.getElementById("jabatan");

const noHpInput =
    document.getElementById("no-hp");

const statusInput =
    document.getElementById("status");

const formMessage =
    document.getElementById("form-message");

const saveButton =
    document.getElementById("save-button");

const userEmail =
    document.getElementById("user-email");

const logoutButton =
    document.getElementById("logout-button");


// ========================================
// DATA LOKAL
// ========================================

let semuaAnggota = [];


// ========================================
// CEK LOGIN
// ========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Pengurus login:",
            user.email
        );

        if (userEmail) {
            userEmail.textContent =
                user.email || "Pengurus";
        }

        loadAnggota();

    } else {

        // Jika belum login
        window.location.href = "login.html";

    }

});


// ========================================
// AMBIL DATA ANGGOTA
// ========================================

async function loadAnggota() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Memuat data anggota...
                </td>
            </tr>
        `;


        const snapshot =
            await getDocs(anggotaCollection);


        semuaAnggota = [];


        snapshot.forEach((documentSnapshot) => {

            semuaAnggota.push({

                id: documentSnapshot.id,

                ...documentSnapshot.data()

            });

        });


        // Urutkan berdasarkan nama
        semuaAnggota.sort((a, b) => {

            return (a.Nama || "")
                .localeCompare(
                    b.Nama || "",
                    "id"
                );

        });


        tampilkanAnggota(semuaAnggota);


    } catch (error) {

        console.error(
            "Gagal mengambil data:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="error">
                    Gagal memuat data anggota.
                    <br>
                    ${error.message}
                </td>
            </tr>
        `;

    }

}


// ========================================
// TAMPILKAN DATA KE TABEL
// ========================================

function tampilkanAnggota(data) {

    tableBody.innerHTML = "";


    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Belum ada data anggota.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach((anggota, index) => {

        const row =
            document.createElement("tr");


        const statusClass =
            anggota.Status === "Aktif"
                ? "status-active"
                : "status-inactive";


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${escapeHTML(anggota.Nama || "-")}
                </strong>
            </td>

            <td>
                ${escapeHTML(anggota.Jabatan || "-")}
            </td>

            <td>
                ${escapeHTML(anggota.No_Hp || "-")}
            </td>

            <td>

                <span class="${statusClass}">
                    ${escapeHTML(anggota.Status || "-")}
                </span>

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="btn-edit"
                        data-id="${anggota.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="btn-delete"
                        data-id="${anggota.id}"
                    >
                        Hapus
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });


    // Tombol edit
    document
        .querySelectorAll(".btn-edit")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    editAnggota(id);

                }

            );

        });


    // Tombol hapus
    document
        .querySelectorAll(".btn-delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    hapusAnggota(id);

                }

            );

        });

}


// ========================================
// TAMBAH ANGGOTA
// ========================================

tambahButton.addEventListener(
    "click",
    () => {

        bukaModalTambah();

    }
);


// ========================================
// BUKA MODAL TAMBAH
// ========================================

function bukaModalTambah() {

    modalTitle.textContent =
        "Tambah Anggota";


    anggotaId.value = "";


    form.reset();


    statusInput.value = "";


    formMessage.textContent = "";


    saveButton.textContent =
        "Simpan";


    modal.classList.add("show");

}


// ========================================
// EDIT ANGGOTA
// ========================================

function editAnggota(id) {

    const anggota =
        semuaAnggota.find(
            item => item.id === id
        );


    if (!anggota) {

        alert(
            "Data anggota tidak ditemukan."
        );

        return;

    }


    modalTitle.textContent =
        "Edit Anggota";


    anggotaId.value =
        anggota.id;


    namaInput.value =
        anggota.Nama || "";


    jabatanInput.value =
        anggota.Jabatan || "";


    noHpInput.value =
        anggota.No_Hp || "";


    statusInput.value =
        anggota.Status || "";


    formMessage.textContent = "";


    saveButton.textContent =
        "Simpan Perubahan";


    modal.classList.add("show");

}


// ========================================
// SIMPAN DATA
// ========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const nama =
            namaInput.value.trim();

        const jabatan =
            jabatanInput.value.trim();

        const noHp =
            noHpInput.value.trim();

        const status =
            statusInput.value;


        if (
            !nama ||
            !jabatan ||
            !noHp ||
            !status
        ) {

            formMessage.textContent =
                "Semua data harus diisi.";

            return;

        }


        try {

            saveButton.disabled = true;

            saveButton.textContent =
                "Menyimpan...";


            const dataAnggota = {

                Nama: nama,

                Jabatan: jabatan,

                No_Hp: noHp,

                Status: status

            };


            // =================================
            // TAMBAH
            // =================================

            if (!anggotaId.value) {

                await addDoc(
                    anggotaCollection,
                    dataAnggota
                );


                formMessage.textContent =
                    "Anggota berhasil ditambahkan.";

            }


            // =================================
            // EDIT
            // =================================

            else {

                const anggotaRef =
                    doc(
                        db,
                        "anggota",
                        anggotaId.value
                    );


                await updateDoc(
                    anggotaRef,
                    dataAnggota
                );


                formMessage.textContent =
                    "Data anggota berhasil diperbarui.";

            }


            // Tunggu sebentar
            await new Promise(
                resolve =>
                    setTimeout(resolve, 500)
            );


            tutupModal();


            await loadAnggota();


        } catch (error) {

            console.error(
                "Gagal menyimpan:",
                error
            );


            formMessage.textContent =
                "Gagal menyimpan data: " +
                error.message;


        } finally {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Simpan";

        }

    }
);


// ========================================
// HAPUS ANGGOTA
// ========================================

async function hapusAnggota(id) {

    const anggota =
        semuaAnggota.find(
            item => item.id === id
        );


    if (!anggota) {
        return;
    }


    const konfirmasi =
        confirm(
            `Apakah kamu yakin ingin menghapus anggota "${anggota.Nama}"?`
        );


    if (!konfirmasi) {
        return;
    }


    try {

        const anggotaRef =
            doc(
                db,
                "anggota",
                id
            );


        await deleteDoc(
            anggotaRef
        );


        alert(
            "Data anggota berhasil dihapus."
        );


        await loadAnggota();


    } catch (error) {

        console.error(
            "Gagal menghapus:",
            error
        );


        alert(
            "Gagal menghapus data: " +
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

            tampilkanAnggota(
                semuaAnggota
            );

            return;

        }


        const hasil =
            semuaAnggota.filter(
                anggota => {

                    const nama =
                        (
                            anggota.Nama ||
                            ""
                        ).toLowerCase();


                    const jabatan =
                        (
                            anggota.Jabatan ||
                            ""
                        ).toLowerCase();


                    const noHp =
                        (
                            anggota.No_Hp ||
                            ""
                        ).toLowerCase();


                    return (
                        nama.includes(keyword) ||
                        jabatan.includes(keyword) ||
                        noHp.includes(keyword)
                    );

                }
            );


        tampilkanAnggota(
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

    anggotaId.value = "";

    formMessage.textContent = "";

    saveButton.disabled = false;

    saveButton.textContent =
        "Simpan";

}


// ========================================
// KLIK LUAR MODAL
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

            await signOut(auth);


            window.location.href =
                "login.html";


        } catch (error) {

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
// KEAMANAN HTML
// ========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}