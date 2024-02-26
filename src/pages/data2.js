// data.js
const data2 = [
  {
    roomNumber: "101",
    bedType: "Single",
    roomFloor: "1",
    roomFacility: "Wi-Fi, TV",
    status: "Available",
  },
  {
    roomNumber: "102",
    bedType: "Double",
    roomFloor: "1",
    roomFacility: "Wi-Fi, TV, Minibar",
    status: "Occupied",
  },
  {
    roomNumber: "103",
    bedType: "Queen",
    roomFloor: "1",
    roomFacility: "Wi-Fi, TV, Minibar, Balcony",
    status: "Available",
  },
  {
    roomNumber: "104",
    bedType: "Single",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV",
    status: "Maintenance",
  },
  {
    roomNumber: "105",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },

  {
    roomNumber: "106",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "107",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "108",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "108",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "109",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "110",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "111",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "112",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "113",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "114",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Maintenance",
  },
  {
    roomNumber: "115",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "116",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "117",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "118",
    bedType: "King",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
  {
    roomNumber: "119",
    bedType: "Single",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Booked",
  },
  {
    roomNumber: "120",
    bedType: "Queen",
    roomFloor: "2",
    roomFacility: "Wi-Fi, TV, Minibar, Jacuzzi",
    status: "Available",
  },
];

for (let i = 3; i <= 35; i++) {
  data2.push({
    roomNumber: (100 + i).toString(),
    bedType: ["Single", "Double", "Queen", "King"][
      Math.floor(Math.random() * 4)
    ],
    roomFloor: Math.floor(Math.random() * 5) + 1,
    roomFacility: ["Wi-Fi", "TV", "Minibar", "Balcony", "Jacuzzi"][
      Math.floor(Math.random() * 5)
    ],
    status: ["Available", "Occupied", "Maintenance", "Cleaning"][
      Math.floor(Math.random() * 4)
    ],
  });
}

export default data2;
