// === Konfigurasi Telegram ===
const BOT_TOKEN  = "7635408983:AAHrM9l9mXMYMrX6K6IP_my1tR-gHCmADBM";
const CHAT_ID    = "-1002386917210";   // grup absensi teks
const CHAT_BUKTI = "-1002406787864";   // grup bukti gambar

// === Data kelas & nama ===
const dataKelas = ["X","XI","XII"];
const namaXII = [
 "Ahmad Ofilluloh","Arya Arsal Assalam","Ayu Destanty Kusuma Dewi",
 "Dara Yuliana","Ebikael Fikanon","Galih Ilyasa","Muhamad Saeful Fallah",
 "Nazhif Nur Rizal","Pachril Purnama Jeniardi","Rahayu Agustian",
 "Ratih Hermawati","Raysha Heriyana","Revina Putri","Rizky Saputra",
 "Rosa Andriani","Salma Nurraisha","Serli Oktaviani","Siva Aviandini",
 "Teten Mahmud","Triawan Pujiono","Zahra Salsabilah","Rizky Syahputra"
];

// === Variabel penyimpanan sementara (24 jam) ===
let selectedKelas="", selectedNama="", selectedKet="";
let absenData = JSON.parse(localStorage.getItem("absenData")||"{}");
const now = Date.now();
// hapus data lebih dari 24 jam
for (const k in absenData){
  if (now - absenData[k].time > 24*60*60*1000) delete absenData[k];
}
localStorage.setItem("absenData", JSON.stringify(absenData));

// === Elemen DOM ===
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupBody = document.getElementById("popupBody");
const waktuEl = document.getElementById("waktu");
const pesanEl = document.getElementById("pesan");
const fileInput = document.getElementById("buktiFile");

// === Update Jam Real-time ===
setInterval(()=>{
  const d = new Date();
  waktuEl.textContent = d.toLocaleString("id-ID");
},1000);

// === Popup Handler ===
function showPopup(title, options, callback){
  popupTitle.textContent = title;
  popupBody.innerHTML = "";
  options.forEach(opt=>{
    const btn=document.createElement("button");
    btn.textContent=opt;
    btn.onclick=()=>{ callback(opt); closePopup(); };
    popupBody.appendChild(btn);
  });
  popup.classList.remove("hidden");
}
function closePopup(){ popup.classList.add("hidden"); }
document.getElementById("popupClose").onclick = closePopup;

// === Tombol Kelas/Nama/Keterangan ===
document.getElementById("btnKelas").onclick = ()=> {
  showPopup("Pilih Kelas", dataKelas, val=>{ selectedKelas=val; });
};

document.getElementById("btnNama").onclick = ()=> {
  if(!selectedKelas){ alert("Pilih kelas dulu!"); return; }
  let namaList = selectedKelas==="XII"? namaXII : ["(belum diisi)"];
  // filter yang sudah absen
  const filtered = namaList.filter(n=>!absenData[n]);
  if(filtered.length===0){ alert("Semua sudah absen"); return; }
  showPopup("Pilih Nama", filtered, val=>{ selectedNama=val; });
};

document.getElementById("btnKet").onclick = ()=> {
  showPopup("Keterangan", ["Hadir","Izin","Alfa"], val=>{ selectedKet=val; });
};

// === Kirim Absensi ===
document.getElementById("btnKirim").onclick = async ()=>{
  if(!selectedKelas || !selectedNama || !selectedKet){
    alert("Lengkapi pilihan dulu!");
    return;
  }
  if(absenData[selectedNama]){
    alert("Nama sudah absen hari ini!");
    return;
  }
  const waktu = new Date().toLocaleString("id-ID");
  let text = `✅${selectedNama} Sudah Absen\n${waktu}\n\n1. ${selectedNama} (${selectedKet})`;

  // kirim file jika ada
  if(fileInput.files.length>0){
    const fd = new FormData();
    fd.append("chat_id", CHAT_BUKTI);
    fd.append("photo", fileInput.files[0]);
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{method:"POST",body:fd});
  }

  // kirim pesan teks
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({chat_id:CHAT_ID,text})
  });

  // simpan ke localStorage
  absenData[selectedNama]={ket:selectedKet,time:Date.now()};
  localStorage.setItem("absenData", JSON.stringify(absenData));

  alert("Absensi terkirim!");
  selectedNama=selectedKet="";
};

// === Riwayat ===
document.getElementById("btnRiwayat").onclick = ()=>{
  const rb = document.getElementById("riwayatBody");
  rb.innerHTML="";
  dataKelas.forEach(k=>{
    const btn=document.createElement("button");
    btn.textContent="Kelas "+k;
    btn.onclick=()=>{
      const list = Object.keys(absenData).filter(n=>namaXII.includes(n));
      const ul = document.createElement("div");
      ul.innerHTML = list.length? list.map(n=>`✅ ${n} (${absenData[n].ket})`).join("<br>") : "Belum ada";
      rb.innerHTML="";
      rb.appendChild(ul);
    };
    rb.appendChild(btn);
  });
  document.getElementById("riwayatModal").classList.remove("hidden");
};
function closeRiwayat(){
  document.getElementById("riwayatModal").classList.add("hidden");
}