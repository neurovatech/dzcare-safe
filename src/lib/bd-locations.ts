// Bangladesh divisions → districts, plus service areas for the districts we
// cover most. Districts without an area list get a free-text "Area" field.

export const divisions: Record<string, string[]> = {
  Dhaka: [
    "Dhaka", "Gazipur", "Narayanganj", "Narsingdi", "Manikganj", "Munshiganj", "Tangail", "Kishoreganj",
    "Faridpur", "Gopalganj", "Madaripur", "Rajbari", "Shariatpur",
  ],
  Chattogram: [
    "Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Noakhali", "Lakshmipur", "Chandpur", "Brahmanbaria",
    "Rangamati", "Khagrachhari", "Bandarban",
  ],
  Rajshahi: ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Natore", "Naogaon", "Chapainawabganj", "Joypurhat"],
  Khulna: ["Khulna", "Jashore", "Satkhira", "Bagerhat", "Kushtia", "Jhenaidah", "Magura", "Narail", "Chuadanga", "Meherpur"],
  Barishal: ["Barishal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokathi", "Barguna"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Lalmonirhat", "Thakurgaon", "Panchagarh"],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export const areas: Record<string, string[]> = {
  Dhaka: [
    "Adabor", "Badda", "Banani", "Bangshal", "Baridhara", "Bashundhara R/A", "Cantonment", "Chawkbazar", "Dakshinkhan",
    "Demra", "Dhanmondi", "Gendaria", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan",
    "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel",
    "Mugda", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura", "Sabujbagh", "Savar", "Shah Ali", "Shahbagh",
    "Shyampur", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Vatara", "Wari",
  ],
  Gazipur: ["Gazipur Sadar", "Tongi", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Konabari", "Board Bazar"],
  Narayanganj: ["Narayanganj Sadar", "Fatullah", "Siddhirganj", "Bandar", "Rupganj", "Sonargaon", "Araihazar"],
  Chattogram: [
    "Agrabad", "Bakalia", "Bayazid", "Chandgaon", "Chawkbazar", "Double Mooring", "Halishahar", "Khulshi", "Kotwali",
    "Pahartali", "Panchlaish", "Patenga", "Sitakunda", "Hathazari",
  ],
};

export const isValidDistrict = (division: string, district: string) => divisions[division]?.includes(district) ?? false;
