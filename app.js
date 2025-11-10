// ============================================
// CONFIGURATION
// ============================================
const defaultConfig = {
  background_color: "#f0f4f8",
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#64748b",
  font_family: "system-ui",
  font_size: 16,
  form_title: "Forum Pengajuan Izin Digital",
  form_subtitle: "Lengkapi formulir di bawah ini untuk mengajukan izin",
  submit_button_text: "Kirim Pengajuan"
};

// ============================================
// STATE + FALLBACK STORAGE
// ============================================
let currentRecordCount = 0;
const LS_KEY = "pengajuan_izin_records_v1";

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveLocal(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

// ============================================
// DATA SDK HANDLER (opsional)
// ============================================
const dataHandler = {
  onDataChanged(data) {
    currentRecordCount = data.length;
    renderSubmissions(data);
  }
};

// ============================================
// ELEMENT SDK - CONFIG CHANGE HANDLER
// ============================================
async function onConfigChange(config = {}) {
  const customFont = config.font_family || defaultConfig.font_family;
  const baseFontStack = "system-ui, -apple-system, sans-serif";
  const baseSize = config.font_size || defaultConfig.font_size;

  const backgroundColor = config.background_color || defaultConfig.background_color;
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const primaryColor = config.primary_action_color || defaultConfig.primary_action_color;
  const secondaryColor = config.secondary_action_color || defaultConfig.secondary_action_color;

  document.body.style.background = backgroundColor;
  document.body.style.color = textColor;
  document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

  const formTitle = document.getElementById("form-title");
  formTitle.textContent = config.form_title || defaultConfig.form_title;
  formTitle.style.fontSize = `${baseSize * 2}px`;
  formTitle.style.color = "#ffffff";
  formTitle.style.fontFamily = `${customFont}, ${baseFontStack}`;

  const formSubtitle = document.getElementById("form-subtitle");
  formSubtitle.textContent = config.form_subtitle || defaultConfig.form_subtitle;
  formSubtitle.style.fontSize = `${baseSize * 1.25}px`;
  formSubtitle.style.color = "#ffffff";
  formSubtitle.style.fontFamily = `${customFont}, ${baseFontStack}`;

  const submitText = document.getElementById("submit-text");
  submitText.textContent = config.submit_button_text || defaultConfig.submit_button_text;

  // Kontainer kartu (gunakan .glass-card yang sudah ada)
  document.querySelectorAll(".glass-card").forEach(container => {
    container.style.background = surfaceColor;
  });

  document.querySelectorAll("h2").forEach(heading => {
    heading.style.fontSize = `${baseSize * 1.5}px`;
    heading.style.color = textColor;
    heading.style.fontFamily = `${customFont}, ${baseFontStack}`;
  });

  document.querySelectorAll("label").forEach(label => {
    label.style.fontSize = `${baseSize * 0.875}px`;
    label.style.color = textColor;
    label.style.fontFamily = `${customFont}, ${baseFontStack}`;
  });

  document.querySelectorAll("input, textarea, select").forEach(input => {
    input.style.fontSize = `${baseSize}px`;
    input.style.color = textColor;
    input.style.borderColor = secondaryColor;
    input.style.fontFamily = `${customFont}, ${baseFontStack}`;
  });

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.style.background = primaryColor;
  submitBtn.style.color = "#ffffff";
  submitBtn.style.fontSize = `${baseSize * 1.125}px`;
  submitBtn.style.fontFamily = `${customFont}, ${baseFontStack}`;
}

// ============================================
// HELPERS
// ============================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast text-white";
  toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function toISODateFromParts(y, m, d) {
  const pad = n => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function validateFile(file, maxMB = 5, allowed = []) {
  const okSize = file.size <= maxMB * 1024 * 1024;
  const okType = allowed.length ? allowed.some(a => file.type.includes(a)) : true;
  return okSize && okType;
}

// ============================================
// RENDER SUBMISSIONS
// ============================================
function renderSubmissions(data) {
  const container = document.getElementById("submissions-list");

  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-center py-8 text-gray-500">Belum ada pengajuan</p>';
    return;
  }

  const cfg = (window.elementSdk && window.elementSdk.config) || {};
  const primary = cfg.primary_action_color || defaultConfig.primary_action_color;
  const textColor = cfg.text_color || defaultConfig.text_color;

  const sortedData = [...data].sort((a, b) =>
    new Date(b.tanggal_pengajuan) - new Date(a.tanggal_pengajuan)
  );

  container.innerHTML = sortedData.map(submission => `
    <div class="submission-card bg-white rounded-xl p-6 shadow-md" style="border-left-color:${primary}">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-bold" style="color:${textColor}">${submission.nama_lengkap}</h3>
          <p class="text-sm mt-1 opacity-70">NIK: ${submission.nik}</p>
        </div>
        <span class="px-4 py-2 rounded-full text-sm font-bold shadow-sm"
              style="background: linear-gradient(135deg, ${primary}, #64748b); color:white;">
          ${submission.status || "Menunggu"}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <span class="font-semibold block mb-1">📍 Tempat, Tanggal Lahir:</span>
          <p>${submission.tempat_lahir}, ${new Date(submission.tanggal_lahir).toLocaleDateString("id-ID")}</p>
        </div>
        <div>
          <span class="font-semibold block mb-1">📞 Kontak:</span>
          <p>${submission.no_telepon}</p>
          <p>${submission.email}</p>
        </div>
      </div>

      <div class="mb-4 bg-blue-50 p-4 rounded-lg">
        <span class="font-semibold text-sm block mb-2">🏠 Alamat:</span>
        <p class="text-sm">${submission.alamat}</p>
      </div>

      <div class="mb-4 bg-purple-50 p-4 rounded-lg">
        <span class="font-semibold text-sm block mb-2">✍️ Alasan:</span>
        <p class="text-sm whitespace-pre-wrap">${submission.alasan}</p>
      </div>

      <div class="flex flex-wrap items-center gap-4 mt-2">
        ${submission.foto_ktp_url ? `
          <a href="${submission.foto_ktp_url}" target="_blank"
             class="underline text-sm">Lihat Foto KTP</a>` : ``}
        ${submission.surat_keterangan_url ? `
          <a href="${submission.surat_keterangan_url}" target="_blank"
             class="underline text-sm">Lihat Surat</a>` : ``}
        <span class="text-xs text-gray-500 ml-auto">
          Dikirim: ${new Date(submission.tanggal_pengajuan).toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  `).join("");
}

// ============================================
// INIT OPTIONS (Tanggal/Bulan/Tahun)
// ============================================
function populateDateSelectors() {
  const tanggal = document.getElementById("tanggal");
  const bulan = document.getElementById("bulan");
  const tahun = document.getElementById("tahun");

  // tanggal 1..31
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = String(d).padStart(2, "0");
    opt.textContent = d;
    tanggal.appendChild(opt);
  }

  // tahun (1930..tahun ini)
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= 1930; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    tahun.appendChild(opt);
  }

  // opsional: sesuaikan jumlah hari ketika bulan/tahun berubah (leap year)
  function adjustDays() {
    const y = parseInt(tahun.value || thisYear, 10);
    const m = parseInt(bulan.value || "1", 10);
    const daysInMonth = new Date(y, m, 0).getDate();
    const current = tanggal.value;
    tanggal.innerHTML = '<option value="">Tanggal</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement("option");
      opt.value = String(d).padStart(2, "0");
      opt.textContent = d;
      tanggal.appendChild(opt);
    }
    if (current && parseInt(current, 10) <= daysInMonth) {
      tanggal.value = current;
    }
  }
  bulan.addEventListener("change", adjustDays);
  tahun.addEventListener("change", adjustDays);
}

// ============================================
// FILE PREVIEW
// ============================================
function setupFilePreviews() {
  const ktpInput = document.getElementById("foto_ktp");
  const ktpPreview = document.getElementById("ktp-preview");
  const ktpImage = document.getElementById("ktp-image");

  const suratInput = document.getElementById("surat_keterangan");
  const suratPreview = document.getElementById("surat-preview");
  const suratImage = document.getElementById("surat-image");

  ktpInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file, 5, ["image"])) {
      showToast("File KTP terlalu besar atau tipe tidak sesuai.", "error");
      ktpInput.value = "";
      ktpPreview.classList.add("hidden");
      return;
    }

    const url = await fileToDataURL(file);
    ktpImage.src = url;
    ktpPreview.querySelector("p").textContent = `Terunggah: ${file.name}`;
    ktpPreview.classList.remove("hidden");
  });

  suratInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // izinkan image atau pdf
    const isOK = validateFile(file, 5, ["image", "pdf"]);
    if (!isOK) {
      showToast("File Surat terlalu besar atau tipe tidak sesuai.", "error");
      suratInput.value = "";
      suratPreview.classList.add("hidden");
      return;
    }

    if (file.type.includes("image")) {
      const url = await fileToDataURL(file);
      suratImage.src = url;
      suratPreview.querySelector("p").textContent = `Terunggah: ${file.name}`;
      suratImage.classList.remove("hidden");
    } else {
      // PDF: sembunyikan img preview, tampilkan keterangan
      suratImage.src = "";
      suratImage.classList.add("hidden");
      suratPreview.querySelector("p").textContent = `Terunggah: ${file.name} (PDF)`;
    }
    suratPreview.classList.remove("hidden");
  });
}

// ============================================
// SUBMIT HANDLER
// ============================================
async function onSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("submit-btn");
  const spinner = document.getElementById("submit-spinner");
  btn.disabled = true;
  spinner.classList.remove("hidden");

  try {
    const form = e.currentTarget;
    const nama_lengkap = form.nama_lengkap.value.trim();
    const nik = form.nik.value.trim();
    const tempat_lahir = form.tempat_lahir.value.trim();
    const d = form.tanggal.value;
    const m = form.bulan.value;
    const y = form.tahun.value;
    const alamat = form.alamat.value.trim();
    const no_telepon = form.no_telepon.value.trim();
    const email = form.email.value.trim();
    const alasan = form.alasan.value.trim();

    if (!nama_lengkap || !nik || !tempat_lahir || !d || !m || !y || !alamat || !no_telepon || !email || !alasan) {
      showToast("Lengkapi semua kolom wajib.", "error");
      return;
    }

    // Files
    const ktpFile = form.foto_ktp.files?.[0];
    const suratFile = form.surat_keterangan.files?.[0];
    if (!ktpFile || !suratFile) {
      showToast("Mohon unggah semua lampiran yang diperlukan.", "error");
      return;
    }

    if (!validateFile(ktpFile, 5, ["image"]) || !validateFile(suratFile, 5, ["image", "pdf"])) {
      showToast("Validasi file gagal. Periksa ukuran/tipe berkas.", "error");
      return;
    }

    // Untuk demo: simpan dataURL (produksi sebaiknya upload ke storage dan simpan URL)
    const foto_ktp_url = await fileToDataURL(ktpFile);
    const surat_keterangan_url = await fileToDataURL(suratFile);

    const record = {
      nama_lengkap,
      nik,
      tempat_lahir,
      tanggal_lahir: toISODateFromParts(y, m, d),
      alamat,
      no_telepon,
      email,
      alasan,
      foto_ktp_url,
      surat_keterangan_url,
      status: "Menunggu",
      tanggal_pengajuan: new Date().toISOString()
    };

    // =========================
    // Simpan via Data SDK jika ada
    // (gantikan sesuai API SDK Anda)
    // =========================
    if (window.dataSdk && typeof window.dataSdk.create === "function") {
      await window.dataSdk.create(record);
      showToast("Pengajuan berhasil dikirim (SDK).");
    } else {
      // fallback local
      const list = loadLocal();
      list.push(record);
      saveLocal(list);
      showToast("Pengajuan berhasil disimpan (local).");
      renderSubmissions(list);
    }

    // Reset form
    form.reset();
    document.getElementById("ktp-preview").classList.add("hidden");
    document.getElementById("surat-preview").classList.add("hidden");
  } catch (err) {
    console.error(err);
    showToast("Terjadi kesalahan saat mengirim pengajuan.", "error");
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
}

// ============================================
// BOOTSTRAP
// ============================================
function bootstrap() {
  populateDateSelectors();
  setupFilePreviews();

  // Hook submit
  const form = document.getElementById("submission-form");
  form.addEventListener("submit", onSubmit);

  // Inisialisasi tampilan awal (local fallback)
  const existing = loadLocal();
  renderSubmissions(existing);

  // Apply default config di awal
  onConfigChange(defaultConfig);

  // Integrasi elementSdk bila tersedia
  if (window.elementSdk) {
    try {
      // Beberapa SDK menyediakan event config change:
      // Misal: elementSdk.on('configChanged', onConfigChange)
      if (typeof window.elementSdk.on === "function") {
        window.elementSdk.on("configChanged", onConfigChange);
      } else if (window.elementSdk.config) {
        onConfigChange(window.elementSdk.config);
      }
    } catch (e) {
      console.warn("elementSdk integration warning:", e);
    }
  }

  // Integrasi dataSdk bila tersedia (contoh)
  if (window.dataSdk) {
    try {
      if (typeof window.dataSdk.subscribe === "function") {
        window.dataSdk.subscribe(dataHandler.onDataChanged);
      } else if (typeof window.dataSdk.list === "function") {
        window.dataSdk.list().then(dataHandler.onDataChanged).catch(() => {});
      }
    } catch (e) {
      console.warn("dataSdk integration warning:", e);
    }
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
