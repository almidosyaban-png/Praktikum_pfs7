const API_URL = 'backend';

const form = document.getElementById('mahasiswa-form');
const idInput = document.getElementById('mahasiswa-id');
const namaInput = document.getElementById('nama');
const nimInput = document.getElementById('nim');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const formTitle = document.getElementById('form-title');
const tabelBody = document.getElementById('tabel-body');

// Memuat data saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', loadData);

// Fungsi READ (Mengambil data dari read.php)
async function loadData() {
    try {
        const response = await fetch(`${API_URL}/read.php`);
        const result = await response.json();

        tabelBody.innerHTML = '';

        if (result.success && result.data.length > 0) {
            result.data.forEach((mhs, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${escapeHtml(mhs.nama)}</td>
                    <td>${escapeHtml(mhs.nim)}</td>
                    <td>${mhs.created_at}</td>
                    <td>
                        <button class="btn-edit" onclick="editData(${mhs.id}, '${escapeHtml(mhs.nama)}', '${escapeHtml(mhs.nim)}')">Edit</button>
                        <button class="btn-delete" onclick="deleteData(${mhs.id})">Hapus</button>
                    </td>
                `;
                tabelBody.appendChild(row);
            });
        } else {
            tabelBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada data mahasiswa.</td></tr>';
        }
    } catch (error) {
        console.error('Gagal memuat data:', error);
        tabelBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Gagal terhubung ke server backend.</td></tr>';
    }
}

// Fungsi CREATE & UPDATE (Menyimpan atau memperbarui data)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = idInput.value;
    const nama = namaInput.value.trim();
    const nim = nimInput.value.trim();

    if (!nama || !nim) return alert('Nama dan NIM wajib diisi!');

    const endpoint = id ? `${API_URL}/update.php` : `${API_URL}/create.php`;
    const payload = id ? { id: parseInt(id), nama, nim } : { nama, nim };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            resetForm();
            loadData();
        } else {
            alert(result.message || 'Terjadi kesalahan saat menyimpan data.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menghubungi server.');
    }
});

// Mengisi form saat tombol Edit ditekan
function editData(id, nama, nim) {
    idInput.value = id;
    namaInput.value = nama;
    nimInput.value = nim;

    formTitle.textContent = 'Edit Data Mahasiswa';
    btnSubmit.textContent = 'Update';
    btnCancel.classList.remove('hidden');
}

// Fungsi DELETE (Menghapus data)
async function deleteData(id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;

    try {
        const response = await fetch(`${API_URL}/delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(id) })
        });
        const result = await response.json();

        if (result.success) {
            loadData();
        } else {
            alert(result.message || 'Gagal menghapus data.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal menghubungi server.');
    }
}

// Mengembalikan form ke mode Tambah
btnCancel.addEventListener('click', resetForm);

function resetForm() {
    idInput.value = '';
    namaInput.value = '';
    nimInput.value = '';
    formTitle.textContent = 'Tambah Mahasiswa';
    btnSubmit.textContent = 'Simpan';
    btnCancel.classList.add('hidden');
}

// Mencegah XSS sederhana saat menampilkan teks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}