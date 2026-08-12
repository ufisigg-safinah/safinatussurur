import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const container =
    document.getElementById("anggota-container");

const loading =
    document.getElementById("loading");

const emptyMessage =
    document.getElementById("empty-message");

const errorMessage =
    document.getElementById("error-message");


async function tampilkanAnggota() {

    try {

        const snapshot = await getDocs(
            collection(db, "anggota")
        );

        loading.style.display = "none";

        let jumlah = 0;


        snapshot.forEach((doc) => {

            const data = doc.data();


            // Hanya anggota aktif

            if (data.Status !== "Aktif") {
                return;
            }


            jumlah++;


            const nama =
                data.Nama || "Nama";

            const jabatan =
                data.Jabatan || "Anggota";

            const noHp =
                data["No HP"] || "-";


            const huruf =
                nama.charAt(0).toUpperCase();


            const card =
                document.createElement("div");

            card.className = "member-card";


            card.innerHTML = `

                <div class="member-photo">
                    ${huruf}
                </div>

                <h3>
                    ${nama}
                </h3>

                <span class="member-position">
                    ${jabatan}
                </span>

                <div class="member-phone">
                    📱 ${noHp}
                </div>

                <div class="member-status">
                    ● Aktif
                </div>

            `;


            container.appendChild(card);

        });


        if (jumlah === 0) {

            emptyMessage.style.display =
                "block";

        }


        console.log(
            "Jumlah anggota aktif:",
            jumlah
        );


    } catch (error) {

        console.error(
            "Gagal mengambil data anggota:",
            error
        );

        loading.style.display = "none";

        errorMessage.style.display =
            "block";

    }

}


tampilkanAnggota();