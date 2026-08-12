import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const container = document.getElementById("anggota-container");


async function tampilkanAnggota() {

    try {

        const snapshot = await getDocs(
            collection(db, "anggota")
        );

        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = `
                <p>Belum ada data anggota.</p>
            `;

            return;
        }


        snapshot.forEach((doc) => {

            const data = doc.data();

            console.log("Data Firebase:", data);


            const card = document.createElement("div");

            card.className = "member-card";


            card.innerHTML = `
                
                <div class="member-icon">
                    👤
                </div>

                <div class="member-info">

                    <h3>
                        ${data.Nama || "-"}
                    </h3>

                    <p>
                        ${data.Jabatan || "Anggota"}
                    </p>

                    <span>
                        ${data.Status || "Aktif"}
                    </span>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        container.innerHTML = `
            <p>
                Gagal mengambil data anggota.
            </p>
        `;

    }

}


tampilkanAnggota();