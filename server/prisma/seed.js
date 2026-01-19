const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Create Perusahaan
  const companies = [
    { kode: "PPA", nama: "PT. Putra Perkasa Abadi", alamat: "Jakarta" },
    { kode: "PAMA", nama: "PT. Pamapersada Nusantara", alamat: "Jakarta" },
    { kode: "ABB", nama: "PT. Antareja Mahada Makmur", alamat: "Jakarta" },
    // Construction Companies
    { kode: "WSKT", nama: "PT. Waskita Karya (Persero) Tbk", alamat: "Jakarta" },
    { kode: "WIKA", nama: "PT. Wijaya Karya (Persero) Tbk", alamat: "Jakarta" },
    { kode: "ADHI", nama: "PT. Adhi Karya (Persero) Tbk", alamat: "Jakarta" },
    { kode: "PTPP", nama: "PT. PP (Persero) Tbk", alamat: "Jakarta" },
    { kode: "HK", nama: "PT. Hutama Karya (Persero)", alamat: "Jakarta" },
    { kode: "NK", nama: "PT. Nindya Karya (Persero)", alamat: "Jakarta" },
    { kode: "BA", nama: "PT. Brantas Abipraya (Persero)", alamat: "Jakarta" },
    { kode: "TOTAL", nama: "PT. Total Bangun Persada Tbk", alamat: "Jakarta" },
    { kode: "ACSET", nama: "PT. Acset Indonusa Tbk", alamat: "Jakarta" },
    { kode: "JAKON", nama: "PT. Jaya Konstruksi Manggala Pratama Tbk", alamat: "Jakarta" },
  ];

  for (const companyData of companies) {
    const company = await prisma.perusahaan.upsert({
      where: { kode: companyData.kode },
      update: {},
      create: companyData,
    });
    console.log(`Created Company: ${company.nama}`);

    // 2. Departments
    const departments = [
      { kode: "OPS", nama: "Operation" },
      { kode: "ENG", nama: "Engineering" },
      { kode: "PLT", nama: "Plant" },
      { kode: "HSE", nama: "Health Safety Environment" },
      { kode: "HRGA", nama: "HR & GA" },
      { kode: "SCM", nama: "Supply Chain Management" },
    ];

    for (const deptData of departments) {
      const deptCode = `${company.kode}-${deptData.kode}`;
      const department = await prisma.departemen.upsert({
        where: { kode: deptCode },
        update: {},
        create: {
          kode: deptCode,
          nama: deptData.nama,
          perusahaanId: company.id,
        },
      });
      console.log(`  - Created Dept: ${department.nama}`);

      // 3. Jabatan
      let positions = [];
      if (deptData.kode === "OPS") positions = ["Operator", "Foreman", "Supervisor", "Superintendent", "Pit Control"];
      else if (deptData.kode === "ENG") positions = ["Surveyor", "Mine Plan Engineer", "Geologist", "Drill & Blast Eng"];
      else if (deptData.kode === "PLT") positions = ["Mechanic", "Electrician", "Planner", "Inspector"];
      else if (deptData.kode === "HSE") positions = ["Safety Officer", "Medic", "Paramedic", "Enviro Officer"];
      else positions = ["Staff", "Section Head", "Dept Head"];

      for (const posName of positions) {
        const posCode = `${deptCode}-${posName.replace(/\s/g, "").toUpperCase()}`;
        const jabatan = await prisma.jabatan.upsert({
          where: { kode: posCode }, // Note: Using random number might make idempotency tricky if run multiple times without cleanup, but upsert helps if code is mostly stable or we accept duplicates if code changes. For a factory, we usually clear or append.
          // To make it idempotent with upsert, we need a deterministic code.
          // Let's perform a findFirst or just create if distinct names are needed.
          // For 'factory' feel, I'll allow duplicates or make code deterministic.
          // Let's use deterministic code:
          update: {},
          create: {
            kode: `${deptCode}-${posName.replace(/\s/g, "").toUpperCase()}`,
            nama: posName,
            departemenId: department.id,
          },
        });

        // 4. Employees (Karyawan) - Create 3 per position
        const firstNames = ["Budi", "Siti", "Agus", "Dewi", "Eko", "Rina", "Dedi", "Lina", "Hendra", "Sari", "Joko", "Maya", "Rudi", "Wulan", "Tono"];
        const lastNames = ["Santoso", "Wijaya", "Saputra", "Lestari", "Kusuma", "Pratama", "Hidayat", "Mulyani", "Setiawan", "Utami", "Nugroho", "Handayani", "Purnomo", "Rahmawati", "Susanto"];

        for (let i = 0; i < 3; i++) {
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          const name = `${fn} ${ln}`;
          const nrp = `${company.kode}${Math.floor(10000000 + Math.random() * 90000000)}`; // Random NRP

          await prisma.karyawan.create({
            data: {
              nrp: nrp,
              nrpBib: `BIB-${nrp}`,
              nama: name,
              telepon: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Dummy phone
              tinggiBadan: Math.floor(155 + Math.random() * 30), // 155-185
              beratBadan: Math.floor(50 + Math.random() * 40), // 50-90
              status: "ACTIVE",
              departemenId: department.id,
              jabatanId: jabatan.id,
              tanggalLahir: new Date("1990-01-01"),
              tanggalMasuk: new Date(),
            },
          });
        }
      }
    }
  }

  // 5. Seed Jenis Pekerjaan (High Risk)
  const jenisPekerjaanList = [
    { kode: "WAH", nama: "Bekerja di Ketinggian (Working at Height)" },
    { kode: "CSE", nama: "Bekerja di Ruang Terbatas (Confined Space Entry)" },
    { kode: "HAZ", nama: "Bekerja dengan Bahan Kimia Berbahaya (Hazmat)" },
    { kode: "WAW", nama: "Bekerja di Dekat Air (Working around Water)" },
    { kode: "HOT", nama: "Pekerjaan Panas (Hot Work - Las/Gerinda)" },
    { kode: "HV", nama: "Kelistrikan Tegangan Tinggi (High Voltage)" },
    { kode: "LIFT", nama: "Pengoperasian Alat Berat & Lifting (Crane/Rigging)" },
    { kode: "EXC", nama: "Pekerjaan Penggalian Dalam (Excavation)" },
    { kode: "RAD", nama: "Pekerjaan dengan Paparan Radiasi" },
    { kode: "B3", nama: "Penanganan Limbah B3" },
  ];

  for (const jp of jenisPekerjaanList) {
    await prisma.jenisPekerjaan.upsert({
      where: { kode: jp.kode },
      update: {},
      create: jp,
    });
  }
  console.log("Seeded Jenis Pekerjaan.");

  // Seed User for Login
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Administrator" },
  });

  await prisma.user.upsert({
    where: { nrp: "admin" },
    update: {},
    create: {
      nrp: "admin",
      name: "Super Admin",
      password: "admin", // In real app, hash this!
      roleId: adminRole.id,
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
